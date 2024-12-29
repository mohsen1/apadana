import { User } from '@prisma/client';
import { createSafeActionClient } from 'next-safe-action';
import stripAnsi from 'strip-ansi';

import { getUserInServer } from '@/lib/auth';

import { createLogger } from '@/utils/logger';

const logger = createLogger('safe-action');

/**
 * An error that is visible to the client. Throw this error to return an error message to the client.
 */
export class ClientVisibleError extends Error {
  name = 'ClientVisibleError';
}

/**
 * An error that is thrown when the user or IP address is rate limited.
 */
export class RateLimitedError extends Error {
  name = 'RateLimitedError';
}

/**
 * An error that is thrown when the user is not authorized to perform the action.
 */
export class UnauthorizedError extends Error {
  name = 'UnauthorizedError';
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

    if (error instanceof RateLimitedError) {
      return {
        error: 'Too many attempts',
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
