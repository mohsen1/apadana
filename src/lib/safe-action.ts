import { User } from '@prisma/client';
import { headers } from 'next/headers';
import { createSafeActionClient, MiddlewareFn, MiddlewareResult } from 'next-safe-action';
import stripAnsi from 'strip-ansi';

import { getUserInServer } from '@/lib/auth';
import { RateLimiter } from '@/lib/auth/rate-limiter';

import { createLogger } from '@/utils/logger';

const logger = createLogger('safe-action');

/**
 * An error that is visible to the client. Throw this error to return an error message to the client.
 */
export class ClientVisibleError extends Error {
  name = 'ClientVisibleError';
}

/**
 * An error that is thrown when the user is not authorized to perform the action.
 */
export class UnauthorizedError extends Error {
  name = 'UnauthorizedError';
}

export class RateLimitedError extends Error {
  name = 'RateLimitedError';
}

export const baseClient = createSafeActionClient({
  handleServerError: (error) => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Safe action error', error.stack);
      }
      return { error: stripAnsi(error.stack ?? '') };
    }

    if (error instanceof ClientVisibleError) {
      return {
        error: error.message,
      };
    }

    if (error instanceof Error && error.name === 'RateLimitedError') {
      return {
        error: error.message || 'Too many attempts',
      };
    }

    if (error instanceof UnauthorizedError) {
      return {
        error: error.message || 'Unauthorized',
      };
    }
    return {
      error: 'An unknown error occurred',
    };
  },
});

export type SafeActionContext = {
  user?: User | null;
  userId?: string | null;
  resetRateLimit?: () => Promise<void>;
};

export const RATE_LIMIT_BASED_ON_IP = 'ip';
export const RATE_LIMIT_BASED_ON_USER_ID = 'userId';

export type RateLimiterBasedOn = typeof RATE_LIMIT_BASED_ON_IP | typeof RATE_LIMIT_BASED_ON_USER_ID;

interface RateLimiterOptions {
  /**
   * Maximum number of attempts allowed within the window
   */
  maxAttempts?: number;
  /**
   * Time window in milliseconds
   */
  windowMs?: number;
  /**
   * Duration of block in milliseconds when rate limit is exceeded
   */
  blockDurationMs?: number;
  /**
   * What to base the rate limit on
   */
  basedOn?: RateLimiterBasedOn[];
}

/**
 * Creates a rate limiter middleware for actions
 */
export const createRateLimiter = (options: RateLimiterOptions = {}) => {
  const {
    maxAttempts = 100,
    windowMs = 60 * 1000,
    blockDurationMs = 60 * 60 * 1000,
    basedOn = [RATE_LIMIT_BASED_ON_IP],
  } = options;

  const middleware: MiddlewareFn<
    { error: string },
    unknown,
    SafeActionContext,
    SafeActionContext
  > = async ({
    ctx,
    next,
  }: {
    ctx: SafeActionContext;
    next: () => Promise<MiddlewareResult<{ error: string }, SafeActionContext>>;
  }) => {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip');

    if (!ip) {
      logger.warn('Rate limiter middleware skipped because IP is not available', { ip });
      return next();
    }

    const limiter = new RateLimiter({
      maxAttempts,
      windowMs,
      blockDurationMs,
      ip,
    });

    // Create a unique identifier based on the configured options
    const identifier = basedOn
      .map((base) => {
        if (base === RATE_LIMIT_BASED_ON_USER_ID) {
          return ctx.userId ?? 'anonymous';
        }
        return 'ip'; // IP is handled by the RateLimiter class
      })
      .join(':');

    const { blocked, msBeforeNextAttempt } = await limiter.check(identifier);

    if (blocked) {
      const error = new RateLimitedError(
        `Too many attempts. Please try again in ${Math.ceil(msBeforeNextAttempt / 1000)} seconds`,
      );
      throw error;
    }

    await limiter.increment(identifier);

    ctx.resetRateLimit = async () => {
      await limiter.reset(identifier);
    };

    return next();
  };

  return middleware;
};

export const actionClient = baseClient.use<SafeActionContext>(async ({ next }) => {
  const user = await getUserInServer();

  return next({
    ctx: {
      user,
      userId: user?.id ?? null,
    },
  });
});
