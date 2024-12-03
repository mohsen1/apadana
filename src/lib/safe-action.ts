import { createSafeActionClient } from 'next-safe-action';

import { getUserInServer } from '@/lib/auth';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';

import { Session } from '@/__generated__/prisma';
import logger from '@/utils/logger';

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

const baseClient = createSafeActionClient({
  handleServerError: (error) => {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Safe action error', { error });
    }
    if (error instanceof ClientVisibleError) {
      return {
        error: error.message,
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

export const actionClient = baseClient.use(async ({ next }) => {
  const user = await getUserInServer();

  return next({
    ctx: {
      user,
      userId: user?.id,
      setSession,
    },
  });
});

/**
 * Set the session cookie
 * @param session - The session to set
 */
export async function setSession(session: Session) {
  const { cookies } = await import('next/headers');
  const { set: setCookie } = await cookies();
  setCookie(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
    path: '/',
  });
}
