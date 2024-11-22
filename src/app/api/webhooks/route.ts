import {
  clerkClient as getClerkClient,
  SessionJSON,
  UserJSON,
  WebhookEvent,
} from '@clerk/nextjs/server';
import {
  EmailAddress as ClerkEmailAddress,
  ExternalAccount as ClerkExternalAccount,
  Permission,
  Prisma,
  Role,
  User as ClerkUser,
} from '@prisma/client';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

import prisma from '@/lib/prisma/client';

import logger from '@/utils/logger';

// Types
interface ClerkUserComplete extends ClerkUser {
  primaryEmailAddressId: string;
  emailAddresses: Omit<ClerkEmailAddress, 'isPrimary'>[];
  externalAccounts: ClerkExternalAccount[];
}

const clerkClient = await getClerkClient();

// Webhook verification
async function verifyWebhookRequest(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    logger.error('WEBHOOK_SECRET is not configured');
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local',
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.error('Missing required Svix headers', {
      hasSvixId: !!svix_id,
      hasSvixTimestamp: !!svix_timestamp,
      hasSvixSignature: !!svix_signature,
    });
    throw new Error('Missing required Svix headers');
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  try {
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    logger.info('Webhook verified successfully', { type: evt.type });
    return evt;
  } catch (err) {
    logger.error('Failed to verify webhook', { error: err });
    throw new Error('Failed to verify webhook');
  }
}

// User data transformation
async function clerkUserToUserCreateArgsData(
  clerkUser: ClerkUserComplete,
): Promise<Prisma.UserCreateArgs['data']> {
  const orgMemberships = await clerkClient.users.getOrganizationMembershipList({
    userId: clerkUser.id,
  });

  return {
    id: clerkUser.id,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    emailAddresses: {
      create: clerkUser.emailAddresses.map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
        isPrimary: email.id === clerkUser.primaryEmailAddressId,
        verification: email.verification?.[0],
      })),
    },
    externalAccounts: {
      create: clerkUser.externalAccounts
        .filter(
          (externalAccount) => externalAccount.id && externalAccount.provider,
        )
        .map((account) => ({
          id: account.id,
          provider: account.provider,
          externalId: account.externalId,
        })),
    },
    roles: {
      create: orgMemberships.data.map((membership) => ({
        role: mapRole(membership.role),
      })),
    },
  };
}

function assertUserJSON(data: WebhookEvent['data']): asserts data is UserJSON {
  if (data.object !== 'user') {
    throw new Error('Webhook data is not a UserJSON');
  }
}

function assertSessionJSON(
  data: WebhookEvent['data'],
): asserts data is SessionJSON {
  if (data.object !== 'session') {
    throw new Error('Webhook data is not a SessionJSON');
  }
}

// Event handlers
async function handleUserCreatedOrUpdated(userJson: UserJSON) {
  logger.info('Processing user data', {
    type: 'user.created/updated',
    userId: userJson.id,
  });
  return await createOrUpdateUser(userJson);
}

/**
 * Only in development mode we create users from Clerk sessions because sometimes
 * our DB in dev mode is fresh but the Clerk user has already been created.
 */
async function handleSessionCreated(data: SessionJSON) {
  if (process.env.NODE_ENV !== 'development') return;

  logger.info('Processing session data', {
    type: 'session.created',
    userId: data.user_id,
  });

  // check if user exists in database
  const user = await prisma.user.findUnique({
    where: { id: data.user_id },
  });

  if (!user) {
    try {
      const clerkUser = (await clerkClient.users.getUser(
        data.user_id,
      )) as unknown as ClerkUserComplete;

      const userData = await clerkUserToUserCreateArgsData(clerkUser);
      return await prisma.user.create({
        data: userData,
      });
    } catch (e) {
      const error = e as { status?: number };
      if ('status' in error && error.status === 404) {
        logger.error('User not found in Clerk', { userId: data.user_id });
      }
      throw error;
    }
  }
}

async function handleUserDeleted(userId: string) {
  logger.info('Deleting user', { userId });
  return await prisma.user.delete({
    where: { id: userId },
  });
}

// Main webhook handler
export async function POST(req: Request) {
  try {
    const evt = await verifyWebhookRequest(req);

    if (!evt.data.id) {
      logger.error('Webhook payload missing ID');
      return new Response('No ID was provided for data', { status: 400 });
    }

    const data = evt.data;

    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        assertUserJSON(data);
        await handleUserCreatedOrUpdated(data);
        break;
      case 'session.created':
        assertSessionJSON(data);
        await handleSessionCreated(data);
        break;
      case 'user.deleted':
        assertUserJSON(data);
        await handleUserDeleted(data.id);
        break;
    }

    logger.info('Webhook processed successfully', { type: evt.type });
    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    logger.error('Error processing webhook event', { error });
    return new Response(
      error instanceof Error ? error.message : 'Error processing webhook',
      { status: 500 },
    );
  }
}

// Database operations
async function createOrUpdateUser(userJson: UserJSON) {
  const userId = userJson.id;

  if (!userId) {
    logger.error('createOrUpdateUser called without userId');
    throw new Error('No Clerk ID provided');
  }

  const data: Prisma.UserCreateArgs['data'] = {
    id: userId,
    firstName: userJson.first_name,
    lastName: userJson.last_name,
    imageUrl: userJson.image_url,
    externalAccounts: {
      create: userJson.external_accounts
        ?.filter(
          (externalAccount) =>
            externalAccount.id &&
            externalAccount.provider &&
            externalAccount.provider_user_id,
        )
        ?.map((account) => ({
          id: account.id,
          provider: account.provider,
          externalId: account.provider_user_id,
        })),
    },
    roles: {
      create: userJson.organization_memberships?.map((membership) => ({
        role: mapRole(membership.role),
      })),
    },
    permissions: {
      create: userJson.organization_memberships
        ?.filter((membership) => membership.permissions.length > 0)
        .flatMap((membership) =>
          membership.permissions
            .filter((permission) => permission)
            .map((permission) => ({
              permission: mapPermission(permission),
            })),
        ),
    },
    emailAddresses: {
      create: userJson.email_addresses?.map((email) => ({
        id: email.id,
        emailAddress: email.email_address,
        isPrimary: email.object === 'email_address',
        verification: email.verification?.status ?? 'unverified',
      })),
    },
  };

  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  try {
    if (!user) {
      logger.info('Creating new user', { userId });
      return await prisma.user.create({ data });
    }

    logger.info('Updating existing user', { userId });
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  } catch (error) {
    logger.error('Database operation failed in createOrUpdateUser', {
      userId,
      operation: user ? 'update' : 'create',
      error,
    });
    throw error;
  }
}

// Mapping utilities
function mapRole(role: string): Role {
  try {
    switch (role) {
      case 'org:admin':
        return 'ADMIN';
      case 'org:user':
        return 'HOST';
      case 'org:cohost':
        return 'COHOST';
      case 'org:guest':
        return 'GUEST';
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  } catch (error) {
    logger.error('Role mapping failed', { role, error });
    throw error;
  }
}

function mapPermission(permission: string): Permission {
  try {
    switch (permission) {
      case 'org:listing:manage':
        return 'MANAGE_LISTINGS';
      case 'org:member:manage':
        return 'READ_MEMBERS';
      case 'org:billing:manage':
        return 'MANAGE_BILLING';
      case 'org:reports:view':
        return 'VIEW_REPORTS';
      case 'org:settings:edit':
        return 'EDIT_SETTINGS';
      case 'org:domains:manage':
        return 'MANAGE_DOMAINS';
      case 'org:organization:manage':
        return 'MANAGE_ORGANIZATION';
      case 'org:organization:delete':
        return 'DELETE_ORGANIZATION';
      case 'org:members:manage':
        return 'MANAGE_MEMBERS';
      case 'org:user:manage':
        return 'MANAGE_USERS';
      case 'org:role:manage':
        return 'MANAGE_ROLES';
      case 'org:permission:manage':
        return 'MANAGE_PERMISSIONS';
      default:
        throw new Error(`Unknown permission: ${permission}`);
    }
  } catch (error) {
    logger.error('Permission mapping failed', { permission, error });
    throw error;
  }
}
