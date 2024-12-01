import { Session } from '@prisma/client';
import { cookies } from 'next/headers';
import { createSafeActionClient } from 'next-safe-action';

import { getUserFromSession } from '@/lib/auth';

/**
 * An error that is visible to the client. Throw this error to return an error message to the client.
 */
export class ClientVisibleError extends Error {
  name = 'ClientVisibleError';
}

const baseClient = createSafeActionClient({
  handleServerError: (error) => {
    if (error instanceof ClientVisibleError) {
      return {
        error: error.message,
      };
    }
    return {
      error: 'An unknown error occurred',
    };
  },
});

export const actionClient = baseClient.use(async ({ next }) => {
  const user = await getUserFromSession();

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
  const { set: setCookie } = await cookies();
  setCookie('session', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: session.expiresAt,
    path: '/',
  });
}
