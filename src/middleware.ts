import { cookies } from 'next/headers';

import prisma from '@/lib/prisma/client';

export async function middleware(request: Request) {
  const { get: getCookie, delete: deleteCookie } = await cookies();
  const sessionId = getCookie('sessionId')?.value;

  if (!sessionId) {
    return Response.redirect(new URL('/login', request.url));
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    deleteCookie('sessionId');
    return Response.redirect(new URL('/login', request.url));
  }
}
