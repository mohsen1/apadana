import { SESSION_DURATION } from '@/lib/auth/constants';
import prisma from '@/lib/prisma/client';
import { setSession } from '@/lib/safe-action';

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
      const testUser = await prisma.user.findFirst({
        where: {
          emailAddresses: { some: { emailAddress: 'test@example.com' } },
        },
      });
      if (!testUser) {
        return new Response('Test user not found', { status: 404 });
      }

      if (args.userId) {
        const user = await prisma.user.findUnique({
          where: { id: args.userId as string },
        });
        if (!user) {
          return new Response('User not found with the provided ID', {
            status: 404,
          });
        }
      }

      const session = await prisma.session.create({
        data: {
          userId: args.userId ? args.userId : testUser.id,
          expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
        },
      });

      await setSession(session);

      return new Response('OK');
    }
    default: {
      return new Response(`Unknown command "${command}"`, { status: 400 });
    }
  }
}
