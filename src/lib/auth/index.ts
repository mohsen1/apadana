import { cookies } from 'next/headers';

import prisma from '@/lib/prisma/client';

import { Session } from '@/__generated__/prisma';

import { SESSION_COOKIE_NAME } from './constants';

export async function deleteServerSession() {
  const { delete: deleteCookie } = await cookies();
  deleteCookie(SESSION_COOKIE_NAME);
}

export async function setServerSession(session: Session) {
  const { set: setCookie } = await cookies();
  setCookie(SESSION_COOKIE_NAME, session.id, {
    expires: session.expiresAt,
    path: '/',
    httpOnly: true,
    domain: process.env.NEXT_PUBLIC_DOMAIN,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function getServerSession() {
  const { get: getCookie } = await cookies();
  const sessionId = getCookie(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    // This request might not have a session cookie, so we don't need to delete it
    // for subsequent requests.
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
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
    await deleteServerSession();
    return null;
  }

  return user;
}
