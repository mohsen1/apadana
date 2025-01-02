import { headers } from 'next/headers';

import { E2E_TESTING_SECRET_HEADER } from '@/lib/auth/constants';
import { getRedisClient } from '@/lib/redis/client';

import { createLogger } from '@/utils/logger';

const logger = createLogger('rate-limiter');

/** Entry for tracking rate limit attempts */
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

/** Configuration options for the rate limiter */
interface RateLimiterOptions {
  maxAttempts?: number;
  windowMs?: number;
  blockDurationMs?: number;
  ip: string;
}

/**
 * Rate limiter implementation for managing request limits
 * @example
 * ```ts
 * const limiter = new RateLimiter({ maxAttempts: 5, windowMs: 900000 });
 * await limiter.check('login');
 * await limiter.increment('login');
 * ```
 */
export class RateLimiter {
  #maxAttempts: number;
  #windowMs: number;
  #blockDurationMs: number;
  #ip: string;
  /**
   * Creates a new rate limiter instance
   * @param options - Configuration options for the rate limiter
   */
  constructor({
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000,
    blockDurationMs = 60 * 60 * 1000,
    ip,
  }: RateLimiterOptions) {
    this.#maxAttempts = maxAttempts;
    this.#windowMs = windowMs;
    this.#blockDurationMs = blockDurationMs;
    this.#ip = ip;
  }

  /**
   * Checks if the current request should bypass rate limiting
   * @returns True if rate limiting should be bypassed
   */
  async #shouldBypass() {
    const allHeaders = await headers();
    return allHeaders.get(E2E_TESTING_SECRET_HEADER) === process.env.E2E_TESTING_SECRET;
  }

  /**
   * Creates a unique key for rate limiting based on identifier and IP
   * @param identifier - The rate limit identifier (e.g., 'login', 'signup')
   */
  async #createKey(identifier: string): Promise<string> {
    return `ratelimit:${identifier}:${this.#ip}`;
  }

  /**
   * Checks if the current request is rate limited
   * @param identifier - The rate limit identifier to check
   * @returns Object containing blocked status, remaining attempts, and wait time
   */
  async check(
    identifier: string,
  ): Promise<{ blocked: boolean; remainingAttempts: number; msBeforeNextAttempt: number }> {
    if (await this.#shouldBypass()) {
      return { remainingAttempts: this.#maxAttempts, msBeforeNextAttempt: 0, blocked: false };
    }

    const redis = await getRedisClient();
    const key = await this.#createKey(identifier);
    const entryStr = await redis.get(key);
    const entry = entryStr ? (JSON.parse(entryStr) as RateLimitEntry) : null;
    const now = Date.now();

    logger.debug('Checking rate limit', { identifier, key, hasExistingEntry: !!entry });

    if (!entry) {
      return { blocked: false, remainingAttempts: this.#maxAttempts, msBeforeNextAttempt: 0 };
    }

    // 1) First check if there's a block in place
    if (entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        logger.debug('Request blocked by rate limit', {
          identifier,
          key,
          remainingBlockMs: entry.blockedUntil - now,
        });
        return {
          blocked: true,
          remainingAttempts: 0,
          msBeforeNextAttempt: entry.blockedUntil - now,
        };
      } else {
        // Block has expired, remove entry and return fresh state
        await redis.del(key);
        return { blocked: false, remainingAttempts: this.#maxAttempts, msBeforeNextAttempt: 0 };
      }
    }

    // 2) If not blocked, check if window has expired
    if (now - entry.firstAttempt >= this.#windowMs) {
      await redis.del(key);
      return { blocked: false, remainingAttempts: this.#maxAttempts, msBeforeNextAttempt: 0 };
    }

    // Within window and not blocked
    return {
      blocked: false,
      remainingAttempts: Math.max(0, this.#maxAttempts - entry.attempts),
      msBeforeNextAttempt: 0,
    };
  }

  /**
   * Increments the attempt counter for the given identifier
   * @param identifier - The rate limit identifier to increment
   */
  async increment(identifier: string): Promise<void> {
    const redis = await getRedisClient();
    const key = await this.#createKey(identifier);
    const now = Date.now();
    const entryStr = await redis.get(key);
    const entry = entryStr ? (JSON.parse(entryStr) as RateLimitEntry) : null;

    if (!entry || now - entry.firstAttempt >= this.#windowMs) {
      const newEntry = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      };

      await redis
        .multi()
        .set(key, JSON.stringify(newEntry))
        .expire(key, Math.ceil(this.#windowMs / 1000))
        .exec();
      return;
    }

    const newAttempts = entry.attempts + 1;

    if (newAttempts >= this.#maxAttempts) {
      logger.warn('Rate limit exceeded', {
        ip: this.#ip,
        identifier,
        attempts: newAttempts,
        windowStart: new Date(entry.firstAttempt).toISOString(),
        blockDuration: this.#blockDurationMs / 1000 + ' seconds',
      });

      const blockedEntry = {
        attempts: newAttempts,
        firstAttempt: entry.firstAttempt,
        lastAttempt: now,
        blockedUntil: now + this.#blockDurationMs,
      };

      await redis
        .multi()
        .set(key, JSON.stringify(blockedEntry))
        .expire(key, Math.ceil(this.#blockDurationMs / 1000))
        .exec();
      return;
    }

    const updatedEntry = {
      attempts: newAttempts,
      firstAttempt: entry.firstAttempt,
      lastAttempt: now,
    };

    const remainingWindowTime = Math.ceil((this.#windowMs - (now - entry.firstAttempt)) / 1000);
    await redis
      .multi()
      .set(key, JSON.stringify(updatedEntry))
      .expire(key, remainingWindowTime)
      .exec();
  }

  /**
   * Resets the rate limit counter for the given identifier
   * @param identifier - The rate limit identifier to reset
   */
  async reset(identifier: string): Promise<void> {
    const redis = await getRedisClient();
    const key = await this.#createKey(identifier);
    logger.debug('Resetting rate limit', { identifier, key });
    await redis.del(key);
  }
}
