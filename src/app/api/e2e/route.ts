import { setServerSession } from '@/lib/auth';
import { SESSION_DURATION } from '@/lib/auth/constants';
import prisma from '@/lib/prisma/client';

import { prodE2eTestUser } from '@/e2e/fixtures/users';
import { assertError } from '@/utils';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export enum E2ECommand {
  LOGIN = 'login',
  DELETE_ALL_E2E_LISTINGS = 'delete-all-e2e-listings',
}

interface E2ERequest {
  command: E2ECommand;
  args?: Record<string, string>;
}

/**
 * E2E API route. This is only available in the development environment and while
 * running in the e2e test environment.
 */
export async function POST(request: Request) {
  try {
    if (
      process.env.NEXT_PUBLIC_TEST_ENV !== 'e2e' &&
      process.env.NODE_ENV !== 'development'
    ) {
      return new Response('Not allowed', { status: 403 });
    }

    const body = (await request.json()) as E2ERequest;

    const { command, args = {} } = body;

    if (!command) {
      return new Response('No command provided', { status: 400 });
    }

    switch (command) {
      case E2ECommand.LOGIN: {
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
            email,
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
      case E2ECommand.DELETE_ALL_E2E_LISTINGS: {
        await prisma.listing.deleteMany({
          where: {
            owner: {
              emailAddresses: { some: { emailAddress: prodE2eTestUser.email } },
            },
          },
        });
        return new Response(
          JSON.stringify({
            message: 'All E2E listings deleted',
          }),
          { status: 200 },
        );
      }
      default: {
        return new Response(`Unknown command "${command as string}"`, {
          status: 400,
        });
      }
    }
  } catch (error) {
    assertError(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
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
