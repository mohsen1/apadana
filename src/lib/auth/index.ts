import _ from 'lodash';
import { cookies } from 'next/headers';
import { TimeSpan } from 'oslo';
import { Argon2id } from 'oslo/password';

import prisma from '@/lib/prisma/client';

import { ClientUser } from '@/contexts/auth-context';
export const SESSION_DURATION = new TimeSpan(2, 'w'); // 2 weeks
export const RESET_TOKEN_DURATION = new TimeSpan(1, 'h'); // 1 hour

export const SESSION_COOKIE_NAME = 'session' as const;

export const argon = new Argon2id();

/**
 * Authenticate a user on the server side.
 * @returns The session if the user is authenticated, otherwise null.
 */
export async function getUserFromSession() {
  const { get: getCookie } = await cookies();
  const sessionId = getCookie(SESSION_COOKIE_NAME);

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      permissions: true,
      roles: true,
      emailAddresses: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Sign out a user by deleting the session cookie.
 */
export async function signOut() {
  const { set: setCookie } = await cookies();
  setCookie(SESSION_COOKIE_NAME, '', { maxAge: 0 });
}

/**
 * Sanitize a user for client side use. `getUserFromSession` is used for server side
 * code, but we need to sanitize the user for client side code.
 */
export function sanitizeUserForClient(
  user: Awaited<ReturnType<typeof getUserFromSession>>,
): ClientUser | null {
  if (!user) {
    return null;
  }
  const email = user.emailAddresses[0].emailAddress;

  return {
    ..._.pick(user, ['id', 'firstName', 'lastName', 'imageUrl']),
    email,
  };
}
