import { headers } from 'next/headers';

import { createLogger } from '@/utils/logger';

const logger = createLogger('rate-limiter');

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || '127.0.0.1'
  );
}

interface RateLimiterOptions {
  maxAttempts?: number;
  windowMs?: number;
  blockDurationMs?: number;
}

export class RateLimiter {
  #store = new Map<string, RateLimitEntry>();
  #maxAttempts: number;
  #windowMs: number;
  #blockDurationMs: number;

  constructor({
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000,
    blockDurationMs = 60 * 60 * 1000,
  }: RateLimiterOptions = {}) {
    this.#maxAttempts = process.env.NEXT_PUBLIC_TEST_ENV === 'e2e' ? 1000 : maxAttempts;
    this.#windowMs = windowMs;
    this.#blockDurationMs = blockDurationMs;

    // Clean up old entries every hour
    setInterval(() => this.#cleanup(), 60 * 60 * 1000);
  }

  #cleanup() {
    const now = Date.now();
    logger.debug('Starting cleanup of rate limit entries');

    for (const [key, entry] of this.#store.entries()) {
      if (entry.blockedUntil) {
        if (now >= entry.blockedUntil) {
          logger.debug('Removing expired blocked entry', { key });
          this.#store.delete(key);
        }
      } else {
        if (now - entry.firstAttempt >= this.#windowMs) {
          logger.debug('Removing expired window entry', { key });
          this.#store.delete(key);
        }
      }
    }

    logger.debug('Cleanup completed', { remainingEntries: this.#store.size });
  }

  async #createKey(identifier: string): Promise<string> {
    const ip = await getClientIp();
    return `ratelimit:${identifier}:${ip}`;
  }

  async check(
    identifier: string,
  ): Promise<{ blocked: boolean; remainingAttempts: number; msBeforeNextAttempt: number }> {
    const key = await this.#createKey(identifier);
    const now = Date.now();
    const entry = this.#store.get(key);

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
        this.#store.delete(key);
        return { blocked: false, remainingAttempts: this.#maxAttempts, msBeforeNextAttempt: 0 };
      }
    }

    // 2) If not blocked, check if window has expired
    if (now - entry.firstAttempt >= this.#windowMs) {
      this.#store.delete(key);
      return { blocked: false, remainingAttempts: this.#maxAttempts, msBeforeNextAttempt: 0 };
    }

    // Within window and not blocked
    return {
      blocked: false,
      remainingAttempts: Math.max(0, this.#maxAttempts - entry.attempts),
      msBeforeNextAttempt: 0,
    };
  }

  async increment(identifier: string): Promise<void> {
    const key = await this.#createKey(identifier);
    const now = Date.now();
    const entry = this.#store.get(key);

    logger.debug('Incrementing rate limit counter', {
      identifier,
      key,
      currentAttempts: entry?.attempts ?? 0,
    });

    // If no entry or window expired, start fresh
    if (!entry || now - entry.firstAttempt >= this.#windowMs) {
      logger.debug('Starting new rate limit window', { identifier, key });
      this.#store.set(key, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
      return;
    }

    const newAttempts = entry.attempts + 1;

    // Set blocked state if max attempts reached or exceeded
    if (newAttempts >= this.#maxAttempts) {
      const ip = await getClientIp();
      logger.warn('Rate limit exceeded', {
        ip,
        identifier,
        attempts: newAttempts,
        windowStart: new Date(entry.firstAttempt).toISOString(),
        blockDuration: this.#blockDurationMs / 1000 + ' seconds',
      });

      this.#store.set(key, {
        attempts: newAttempts,
        firstAttempt: entry.firstAttempt,
        lastAttempt: now,
        blockedUntil: now + this.#blockDurationMs,
      });
      return;
    }

    logger.debug('Updated rate limit counter', {
      identifier,
      key,
      newAttempts,
      windowStart: new Date(entry.firstAttempt).toISOString(),
    });

    // Regular increment
    this.#store.set(key, {
      attempts: newAttempts,
      firstAttempt: entry.firstAttempt,
      lastAttempt: now,
    });
  }

  async reset(identifier: string): Promise<void> {
    const key = await this.#createKey(identifier);
    logger.debug('Resetting rate limit', { identifier, key });
    this.#store.delete(key);
  }
}

// Create singleton instances
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 60 * 60 * 1000, // 1 hour block duration
});

// More strict limits for signup to prevent abuse
export const signupRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 30 * 60 * 1000,
  blockDurationMs: 2 * 60 * 60 * 1000, // 2 hour block duration
});

export const uploadRateLimiter = new RateLimiter({
  maxAttempts: 50,
  windowMs: 60 * 1000,
  blockDurationMs: 60 * 60 * 1000, // 1 hour block duration
});
