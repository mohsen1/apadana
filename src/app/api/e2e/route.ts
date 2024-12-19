import { Prisma } from '@prisma/client';

import { setServerSession } from '@/lib/auth';
import { SESSION_COOKIE_NAME, SESSION_DURATION } from '@/lib/auth/constants';
import prisma from '@/lib/prisma/client';

import { prodE2eTestHostUser } from '@/e2e/fixtures/data';
import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export type RequestBody =
  | {
      command: 'createUser';
      args: { email: string; password: string };
      response: { userId: string };
    }
  | {
      command: 'login';
      args: { email: string; userId?: string };
      response: {
        email: string;
        userId: string;
        sessionId: string;
        sessionExpiresAt: string;
        cookieName: string;
      };
    }
  | {
      command: 'deleteAllE2eListings';
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      args: {};
      response: { message: string };
    }
  | {
      command: 'createListing';
      args: Prisma.ListingCreateInput;
      response: { listingId: string };
    }
  | {
      command: 'deleteListing';
      args: { id: string };
      response: { message: string };
    };

export type Command = RequestBody['command'];

export type CommandArgs<T extends Command> = Extract<
  RequestBody,
  { command: T }
>['args'];

export type CommandResponse<T extends Command> = Extract<
  RequestBody,
  { command: T }
>['response'];

/**
 * E2E API route. This is only available in the development environment and while
 * running in the e2e test environment.
 */
export async function POST(request: Request) {
  const logger = createLogger('api/e2e/POST');

  try {
    const headers = request.headers;
    const secret = headers.get('x-e2e-testing-secret');

    if (secret !== process.env.E2E_TESTING_SECRET) {
      return new Response('Not allowed', { status: 403 });
    }

    const body = (await request.json()) as RequestBody;

    if (!body.command) {
      return new Response('No command provided', { status: 400 });
    }

    switch (body.command) {
      case 'createUser': {
        // First find user by email
        const existingUser = await prisma.user.findFirst({
          where: {
            emailAddresses: { some: { emailAddress: body.args.email } },
          },
        });

        if (existingUser) {
          // If user exists, just return their ID
          return new Response(JSON.stringify({ userId: existingUser.id }), {
            status: 200,
          });
        }

        // If user doesn't exist, create a new one
        const newUser = await prisma.user.create({
          data: {
            emailAddresses: {
              create: { emailAddress: body.args.email },
            },
            password: body.args.password,
            firstName: 'Test',
            lastName: 'User',
          },
        });

        return new Response(JSON.stringify({ userId: newUser.id }), {
          status: 200,
        });
      }

      case 'login': {
        const email = body.args?.email ?? 'test@example.com';
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
            userId: body.args.userId ?? testUser.id,
            expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
          },
        });

        await setServerSession(session);

        const sessionId = session.id;
        const sessionExpiresAt = session.expiresAt.toISOString();
        const cookieName = SESSION_COOKIE_NAME;

        return new Response(
          JSON.stringify({
            email,
            userId: testUser.id,
            sessionId,
            sessionExpiresAt,
            cookieName,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': 'true',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      }

      case 'deleteAllE2eListings': {
        await prisma.listing.deleteMany({
          where: {
            owner: {
              emailAddresses: {
                some: { emailAddress: prodE2eTestHostUser.email },
              },
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

      case 'createListing': {
        const listing = await prisma.listing.create({
          data: body.args,
        });
        return new Response(
          JSON.stringify({
            listingId: listing.id,
          }),
          { status: 200 },
        );
      }

      case 'deleteListing': {
        await prisma.listing.delete({
          where: { id: body.args.id },
        });
        return new Response(JSON.stringify({ message: 'Listing deleted' }), {
          status: 200,
        });
      }

      default: {
        return new Response(`Unknown command`, {
          status: 400,
        });
      }
    }
  } catch (error) {
    assertError(error);
    logger.error(error);
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
