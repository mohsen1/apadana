import { setServerSession } from '@/lib/auth';
import { SESSION_DURATION } from '@/lib/auth/constants';
import prisma from '@/lib/prisma/client';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

interface E2ECommand {
  command: string;
  args?: Record<string, string>;
}

/**
 * E2E API route. This is only available in the development environment and while
 * running in the e2e test environment.
 */
export async function POST(request: Request) {
  if (
    process.env.TEST_ENV !== 'e2e' &&
    process.env.NODE_ENV !== 'development'
  ) {
    return new Response('Not allowed', { status: 403 });
  }

  const body: E2ECommand = await request.json();

  const { command, args = {} } = body as E2ECommand;

  if (!command) {
    return new Response('No command provided', { status: 400 });
  }

  switch (command) {
    case 'login': {
      const email = args.email ?? 'test@example.com';
      const testUser = await prisma.user.findFirst({
        where: {
          emailAddresses: { some: { emailAddress: email } },
        },
      });
      if (!testUser) {
        return new Response('Test user not found', { status: 404 });
      }

      const session = await prisma.session.create({
        data: {
          userId: args.userId ? args.userId : testUser.id,
          expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
        },
      });

      const cookie = await setServerSession(session);

      return new Response(
        JSON.stringify({
          success: true,
          email: email,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie.toString(),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_DOMAIN,
          },
        },
      );
    }
    default: {
      return new Response(`Unknown command "${command}"`, { status: 400 });
    }
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'Set-Cookie',
      'Access-Control-Allow-Headers': 'Content-Type, Set-Cookie',
    },
  });
}
