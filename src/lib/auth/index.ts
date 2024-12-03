import prisma from '@/lib/prisma/client';

import { SESSION_COOKIE_NAME } from './constants';

export async function getServerSession() {
  const { cookies } = await import('next/headers');
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

  return session;
}

/**
 * Authenticate a user on the server side.
 * @returns The session if the user is authenticated, otherwise null.
 */
export async function getUserInServer() {
  const session = await getServerSession();

  if (!session) {
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
  const { cookies } = await import('next/headers');
  const { set: setCookie } = await cookies();
  setCookie(SESSION_COOKIE_NAME, '', { maxAge: 0 });
}
