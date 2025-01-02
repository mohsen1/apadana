import { headers } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  actionClient,
  createRateLimiter,
  RATE_LIMIT_BASED_ON_IP,
  RATE_LIMIT_BASED_ON_USER_ID,
  SafeActionContext,
} from '@/lib/safe-action';

// Mock storage for Redis data
const mockStorage = new Map<string, string>();

// Mock Redis client
vi.mock('@/lib/redis/client', () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    get: vi.fn((key: string) => Promise.resolve(mockStorage.get(key))),
    set: vi.fn((key: string, value: string) => {
      mockStorage.set(key, value);
      return Promise.resolve('OK');
    }),
    del: vi.fn((key: string) => {
      mockStorage.delete(key);
      return Promise.resolve(1);
    }),
    multi: vi.fn(() => ({
      set: vi.fn(function (this: any, key: string, value: string) {
        this.operations = this.operations || [];
        this.operations.push(() => mockStorage.set(key, value));
        return this;
      }),
      expire: vi.fn(function (this: any) {
        return this;
      }),
      exec: vi.fn(function (this: any) {
        if (this.operations) {
          this.operations.forEach((op: () => void) => op());
        }
        return Promise.resolve(['OK', 'OK']);
      }),
    })),
  }),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({}))),
}));

describe('Rate Limiter', () => {
  const testEmail = 'test@example.com';

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage.clear();

    vi.mocked(headers).mockResolvedValue(
      new Headers({
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '5.6.7.8',
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockStorage.clear();
  });

  describe('Safe Action Rate Limiting', () => {
    const testSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const outputSchema = z.object({
      success: z.boolean(),
    });

    type TestInput = z.infer<typeof testSchema>;
    type TestOutput = z.infer<typeof outputSchema>;

    const testAction = actionClient
      .use(createRateLimiter({ maxAttempts: 3, basedOn: [RATE_LIMIT_BASED_ON_IP] }))
      .schema(testSchema)
      .outputSchema(outputSchema)
      .action(async ({ parsedInput }) => {
        return { success: true };
      });

    beforeEach(() => {
      // Mock the auth middleware for all tests
      vi.spyOn(actionClient, 'use').mockImplementation(
        (middleware: any) =>
          ({
            use: (nextMiddleware: any) => actionClient.use(nextMiddleware),
            schema: (schema: any) => ({
              outputSchema: (outSchema: any) => ({
                action: (handler: any) => async (input: TestInput) => {
                  const ctx = { userId: 'test-user' };
                  const result = await middleware({
                    clientInput: input,
                    bindArgsClientInputs: [],
                    ctx,
                    metadata: undefined,
                    next: async () => ({
                      success: true,
                      parsedInput: input,
                      ctx,
                      data: await handler({ parsedInput: input, ctx }),
                    }),
                  });
                  if ('error' in result) {
                    return { serverError: result };
                  }
                  return { data: result.data, validationErrors: undefined, serverError: undefined };
                },
              }),
            }),
            metadata: undefined,
            bindArgsSchemas: [],
          }) as any,
      );
    });

    it('should rate limit after max attempts', async () => {
      // First 3 attempts should succeed
      for (let i = 0; i < 3; i++) {
        const result = await testAction({ email: testEmail, password: 'test' });
        expect(result?.data).toEqual({ success: true });
      }

      // 4th attempt should be rate limited
      const result = await testAction({ email: testEmail, password: 'test' });
      expect(result?.validationErrors).toBeUndefined();
      expect(result?.serverError?.error).toContain('Too many attempts');
    });

    it('should reset rate limit after window expires', async () => {
      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        await testAction({ email: testEmail, password: 'test' });
      }

      // Move time forward past the window
      vi.advanceTimersByTime(60 * 1000 + 1);

      // Should work again
      const result = await testAction({ email: testEmail, password: 'test' });
      expect(result?.data).toEqual({ success: true });
    });

    it('should handle different IPs separately', async () => {
      // Use up all attempts from first IP
      for (let i = 0; i < 3; i++) {
        await testAction({ email: testEmail, password: 'test' });
      }

      // Change IP
      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-forwarded-for': '9.9.9.9',
        }),
      );

      // Should work with new IP
      const result = await testAction({ email: testEmail, password: 'test' });
      expect(result?.data).toEqual({ success: true });
    });

    it('should handle user-based rate limiting', async () => {
      const userAction = actionClient
        .use(createRateLimiter({ maxAttempts: 3, basedOn: [RATE_LIMIT_BASED_ON_USER_ID] }))
        .schema(testSchema)
        .outputSchema(outputSchema)
        .action(async ({ parsedInput }) => {
          return { success: true };
        });

      // First 3 attempts should succeed
      for (let i = 0; i < 3; i++) {
        const result = await userAction({ email: testEmail, password: 'test' });
        expect(result?.data).toEqual({ success: true });
      }

      // 4th attempt should be rate limited
      const result = await userAction({ email: testEmail, password: 'test' });
      expect(result?.serverError?.error).toBe(
        'Too many attempts. Please try again in 3600 seconds',
      );
    });
  });
});
