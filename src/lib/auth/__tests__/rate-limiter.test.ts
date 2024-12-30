import { headers } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loginRateLimiter, signupRateLimiter } from '../rate-limiter';

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({}))),
}));

describe('Rate Limiters', () => {
  const testEmail = 'test@example.com';

  beforeEach(() => {
    vi.useFakeTimers();

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
  });

  describe('Login Rate Limiter', () => {
    it('should allow 5 login attempts within 15 minutes', async () => {
      // Should allow 5 attempts
      for (let i = 0; i < 5; i++) {
        const result = await loginRateLimiter.check(testEmail);
        expect(result.blocked).toBe(false);
        expect(result.remainingAttempts).toBe(5 - i);
        await loginRateLimiter.increment(testEmail);
      }

      // 6th attempt should be blocked
      const result = await loginRateLimiter.check(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.msBeforeNextAttempt).toBeGreaterThan(0);
    });

    it('should reset login attempts after 15 minutes', async () => {
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        await loginRateLimiter.increment(testEmail);
      }

      // Move time forward 1 hour
      vi.advanceTimersByTime(60 * 60 * 1000);

      // Should be unblocked
      const result = await loginRateLimiter.check(testEmail);
      expect(result.blocked).toBe(false);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should block login attempts for 1 hour after max attempts', async () => {
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        await loginRateLimiter.increment(testEmail);
      }

      // Move time forward 30 minutes (still within block duration)
      vi.advanceTimersByTime(30 * 60 * 1000);

      // Should still be blocked
      const result = await loginRateLimiter.check(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });
  });

  describe('Signup Rate Limiter', () => {
    it('should allow 3 signup attempts within 30 minutes', async () => {
      // Should allow 3 attempts
      for (let i = 0; i < 3; i++) {
        const result = await signupRateLimiter.check(testEmail);
        expect(result.blocked).toBe(false);
        expect(result.remainingAttempts).toBe(3 - i);
        await signupRateLimiter.increment(testEmail);
      }

      // 4th attempt should be blocked
      const result = await signupRateLimiter.check(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.msBeforeNextAttempt).toBeGreaterThan(0);
    });

    it('should reset signup attempts after block duration (2 hours)', async () => {
      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        await signupRateLimiter.increment(testEmail);
      }

      // Move time forward 2 hours (full block duration)
      vi.advanceTimersByTime(2 * 60 * 60 * 1000);

      // Should be unblocked
      const result = await signupRateLimiter.check(testEmail);
      expect(result.blocked).toBe(false);
      expect(result.remainingAttempts).toBe(3);
    });

    it('should block signup attempts for 2 hours after max attempts', async () => {
      // Use up all attempts
      for (let i = 0; i < 3; i++) {
        await signupRateLimiter.increment(testEmail);
      }

      // Move time forward 1 hour (still within block duration)
      vi.advanceTimersByTime(60 * 60 * 1000);

      // Should still be blocked
      const result = await signupRateLimiter.check(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });
  });

  describe('Common Rate Limiter Features', () => {
    it('should handle different IPs separately for both limiters', async () => {
      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-forwarded-for': '1.2.3.4',
          'x-real-ip': '5.6.7.8',
        }),
      );

      await loginRateLimiter.increment(testEmail);
      await signupRateLimiter.increment(testEmail);

      // Clear the mock and set new IP before checking
      vi.clearAllMocks();

      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-forwarded-for': '9.9.9.9',
        }),
      );

      // Should start fresh for new IP
      const loginResult = await loginRateLimiter.check(testEmail);
      expect(loginResult.remainingAttempts).toBe(5);

      const signupResult = await signupRateLimiter.check(testEmail);
      expect(signupResult.remainingAttempts).toBe(3);
    });

    it('should cleanup old entries for both limiters', async () => {
      // Add entries to both limiters
      await loginRateLimiter.increment(testEmail);
      await signupRateLimiter.increment(testEmail);

      // Move time forward past the longest block duration (2 hours)
      vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1);

      // Both should be reset
      const loginResult = await loginRateLimiter.check(testEmail);
      expect(loginResult.remainingAttempts).toBe(5);

      const signupResult = await signupRateLimiter.check(testEmail);
      expect(signupResult.remainingAttempts).toBe(3);
    });

    it('should reset on successful attempt for both limiters', async () => {
      // Use some attempts
      await loginRateLimiter.increment(testEmail);
      await signupRateLimiter.increment(testEmail);

      // Reset both
      await loginRateLimiter.reset(testEmail);
      await signupRateLimiter.reset(testEmail);

      // Both should be reset
      const loginResult = await loginRateLimiter.check(testEmail);
      expect(loginResult.remainingAttempts).toBe(5);

      const signupResult = await signupRateLimiter.check(testEmail);
      expect(signupResult.remainingAttempts).toBe(3);
    });
  });

  describe('Rate Limiter Bypass', () => {
    it('should bypass rate limits when E2E testing secret is provided', async () => {
      process.env.E2E_TESTING_SECRET = 'test-secret';

      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-forwarded-for': '1.2.3.4',
          'x-real-ip': '5.6.7.8',
          'x-e2e-testing-secret': 'test-secret',
        }),
      );

      // Should allow more than max attempts when secret is provided
      for (let i = 0; i < 10; i++) {
        const loginResult = await loginRateLimiter.check(testEmail);
        expect(loginResult.blocked).toBe(false);
        expect(loginResult.remainingAttempts).toBe(5);
        await loginRateLimiter.increment(testEmail);

        const signupResult = await signupRateLimiter.check(testEmail);
        expect(signupResult.blocked).toBe(false);
        expect(signupResult.remainingAttempts).toBe(3);
        await signupRateLimiter.increment(testEmail);
      }
    });

    it('should enforce rate limits when E2E testing secret is incorrect', async () => {
      process.env.E2E_TESTING_SECRET = 'test-secret';

      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-forwarded-for': '1.2.3.4',
          'x-real-ip': '5.6.7.8',
          'x-e2e-testing-secret': 'wrong-secret',
        }),
      );

      // Should block after max attempts with wrong secret
      for (let i = 0; i < 5; i++) {
        await loginRateLimiter.increment(testEmail);
      }

      const result = await loginRateLimiter.check(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should enforce rate limits when E2E testing secret is not provided', async () => {
      process.env.E2E_TESTING_SECRET = 'test-secret';

      vi.mocked(headers).mockResolvedValue(
        new Headers({
          'x-forwarded-for': '1.2.3.4',
          'x-real-ip': '5.6.7.8',
        }),
      );

      // Should block after max attempts with no secret
      for (let i = 0; i < 3; i++) {
        await signupRateLimiter.increment(testEmail);
      }

      const result = await signupRateLimiter.check(testEmail);
      expect(result.blocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });
  });
});
