import { UserJSON, WebhookEvent } from '@clerk/nextjs/server';
import { Permission, Prisma, Role } from '@prisma/client';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

import prisma from '@/lib/prisma/client';

import logger from '@/utils/logger';
export async function POST(req: Request) {
  logger.info('Webhook request received');

  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error('WEBHOOK_SECRET is not configured');
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local',
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.error('Missing required Svix headers', {
      hasSvixId: !!svix_id,
      hasSvixTimestamp: !!svix_timestamp,
      hasSvixSignature: !!svix_signature,
    });
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    logger.info('Webhook verified successfully', { type: evt.type });
  } catch (err) {
    logger.error('Failed to verify webhook', { error: err });
    return new Response('Error occured verifying webhook', {
      status: 400,
    });
  }

  if (!evt.data.id) {
    logger.error('Webhook payload missing user ID');
    return new Response('No user id was provided', {
      status: 400,
    });
  }

  try {
    if (
      evt.type === 'user.created' ||
      evt.type === 'user.updated' ||
      evt.type === 'session.created'
    ) {
      logger.info('Processing user data', {
        type: evt.type,
        userId: evt.data.id,
      });
      await createOrUpdateUser(evt.data as UserJSON);
    }

    if (evt.type === 'user.deleted') {
      logger.info('Deleting user', { userId: evt.data.id });
      await prisma.user.delete({
        where: {
          id: evt.data.id,
        },
      });
    }
  } catch (error) {
    logger.error('Error processing webhook event', {
      type: evt.type,
      userId: evt.data.id,
      error,
    });
    return new Response('Error processing webhook', { status: 500 });
  }

  logger.info('Webhook processed successfully', { type: evt.type });
  return new Response('Webhook received', { status: 200 });
}

/**
 * Create or update a user in the database
 * @param userJson The user data from the webhook
 */
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
    where: {
      id: userId,
    },
  });

  try {
    if (!user) {
      logger.info('Creating new user', { userId });
      return await prisma.user.create({ data });
    }

    logger.info('Updating existing user', { userId });
    return await prisma.user.update({
      where: {
        id: userId,
      },
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
