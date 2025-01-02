import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { E2E_TESTING_SECRET_HEADER } from '@/lib/auth/constants';
import { getRedisClient } from '@/lib/redis/client';

import { RateLimiter } from '../rate-limiter';

// Mock the headers module
const mockHeaders = {
  get: vi.fn(),
};

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve(mockHeaders),
}));

vi.mock('@/lib/redis/client', () => ({
  getRedisClient: vi.fn(),
}));

describe('RateLimiter', () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn().mockReturnThis(),
    del: vi.fn(),
    expire: vi.fn().mockReturnThis(),
    multi: vi.fn(),
    exec: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(getRedisClient).mockResolvedValue(mockRedis as any);
    mockRedis.multi.mockReturnValue(mockRedis);
    mockRedis.exec.mockResolvedValue([]);
    vi.useFakeTimers();
    mockHeaders.get.mockReset();
    process.env.E2E_TESTING_SECRET = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('check', () => {
    it('should allow requests within limits', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const limiter = new RateLimiter({ ip: '127.0.0.1' });
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          attempts: 3,
          firstAttempt: now - 5000,
          lastAttempt: now,
        }),
      );

      const result = await limiter.check('login');

      expect(mockRedis.get).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
      expect(result).toEqual({
        blocked: false,
        remainingAttempts: 2,
        msBeforeNextAttempt: 0,
      });
    });

    it('should block requests when limit exceeded', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const blockedUntil = now + 3600000; // 1 hour
      const limiter = new RateLimiter({ ip: '127.0.0.1' });

      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          attempts: 5,
          firstAttempt: now - 5000,
          lastAttempt: now,
          blockedUntil,
        }),
      );

      const result = await limiter.check('login');

      expect(mockRedis.get).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
      expect(result).toEqual({
        blocked: true,
        remainingAttempts: 0,
        msBeforeNextAttempt: 3600000,
      });
    });

    it('should reset after window expires', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const limiter = new RateLimiter({ ip: '127.0.0.1', windowMs: 900000 }); // 15 minutes
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          attempts: 3,
          firstAttempt: now - 1000000, // > 15 minutes
          lastAttempt: now - 1000000,
        }),
      );

      const result = await limiter.check('login');

      expect(mockRedis.get).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
      expect(mockRedis.del).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
      expect(result).toEqual({
        blocked: false,
        remainingAttempts: 5,
        msBeforeNextAttempt: 0,
      });
    });

    it('should remove block when block duration expires', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const limiter = new RateLimiter({ ip: '127.0.0.1' });
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          attempts: 5,
          firstAttempt: now - 5000,
          lastAttempt: now - 1000,
          blockedUntil: now - 1, // Just expired
        }),
      );

      const result = await limiter.check('login');

      expect(mockRedis.del).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
      expect(result).toEqual({
        blocked: false,
        remainingAttempts: 5,
        msBeforeNextAttempt: 0,
      });
    });
  });

  describe('increment', () => {
    it('should create new entry for first attempt', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const limiter = new RateLimiter({ ip: '127.0.0.1' });
      mockRedis.get.mockResolvedValue(null);

      await limiter.increment('login');

      const expectedEntry = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      };

      expect(mockRedis.multi).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith(
        'ratelimit:login:127.0.0.1',
        JSON.stringify(expectedEntry),
      );
      expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:login:127.0.0.1', 900);
      expect(mockRedis.exec).toHaveBeenCalled();
    });

    it('should increment existing entry', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const limiter = new RateLimiter({ ip: '127.0.0.1' });
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          attempts: 2,
          firstAttempt: now - 5000,
          lastAttempt: now - 1000,
        }),
      );

      await limiter.increment('login');

      const expectedEntry = {
        attempts: 3,
        firstAttempt: now - 5000,
        lastAttempt: now,
      };

      expect(mockRedis.multi).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith(
        'ratelimit:login:127.0.0.1',
        JSON.stringify(expectedEntry),
      );
      expect(mockRedis.expire).toHaveBeenCalled();
      expect(mockRedis.exec).toHaveBeenCalled();
    });

    it('should block when max attempts reached', async () => {
      mockHeaders.get.mockReturnValue(null);
      const now = Date.now();
      const limiter = new RateLimiter({ ip: '127.0.0.1', maxAttempts: 5 });
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          attempts: 4,
          firstAttempt: now - 5000,
          lastAttempt: now - 1000,
        }),
      );

      await limiter.increment('login');

      expect(mockRedis.multi).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith(
        'ratelimit:login:127.0.0.1',
        expect.stringContaining('"blockedUntil"'),
      );
      expect(mockRedis.expire).toHaveBeenCalledWith('ratelimit:login:127.0.0.1', 3600);
      expect(mockRedis.exec).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should delete rate limit entry', async () => {
      mockHeaders.get.mockReturnValue(null);
      const limiter = new RateLimiter({ ip: '127.0.0.1' });

      await limiter.reset('login');

      expect(mockRedis.del).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
    });
  });

  describe('E2E bypass', () => {
    it('should bypass rate limiting with valid E2E testing header', async () => {
      process.env.E2E_TESTING_SECRET = 'test-secret';
      mockHeaders.get.mockImplementation((key) =>
        key === E2E_TESTING_SECRET_HEADER ? 'test-secret' : null,
      );

      const limiter = new RateLimiter({ ip: '127.0.0.1' });
      const result = await limiter.check('login');

      expect(result).toEqual({
        blocked: false,
        remainingAttempts: 5,
        msBeforeNextAttempt: 0,
      });
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should not bypass rate limiting with invalid E2E testing header', async () => {
      process.env.E2E_TESTING_SECRET = 'test-secret';
      mockHeaders.get.mockImplementation((key) =>
        key === E2E_TESTING_SECRET_HEADER ? 'wrong-secret' : null,
      );

      const limiter = new RateLimiter({ ip: '127.0.0.1' });
      mockRedis.get.mockResolvedValue(null);

      await limiter.check('login');

      expect(mockRedis.get).toHaveBeenCalled();
    });
  });
});
