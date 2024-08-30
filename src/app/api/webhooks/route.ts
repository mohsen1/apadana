import { UserJSON, WebhookEvent } from '@clerk/nextjs/server';
import { Permission, Role } from '@prisma/client';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

import { prisma } from '@/lib/prisma/client';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  if (!evt.data.id) {
    return new Response('No user id was provided', {
      status: 400,
    });
  }

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    await createOrUpdateUser(evt.data as UserJSON);
  }

  // eslint-disable-next-line no-console
  console.log('Webhook received, created or updated user with id', evt.data.id);

  return new Response('Webhook received', { status: 200 });
}

/**
 * Create or update a user in the database
 * @param userJson The user data from the webhook
 */
async function createOrUpdateUser(userJson: UserJSON) {
  const userId = userJson.id;

  if (!userId) {
    throw new Error('No Clerk ID provided');
  }

  const data = {
    id: userId,
    firstName: userJson.first_name,
    lastName: userJson.last_name,
    imageUrl: userJson.image_url,
    externalAccounts: {
      create: userJson.external_accounts.map((account) => ({
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
      create: userJson.organization_memberships?.flatMap((membership) =>
        membership.permissions.map((permission) => ({
          permission: mapPermission(permission),
        }))
      ),
    },
    emailAddresses: {
      create: userJson.email_addresses.map((email) => ({
        id: email.id,
        emailAddress: email.email_address,
        verificationStatus: email.verification?.status ?? 'unverified',
        isPrimary: email.object === 'email_address',
      })),
    },
  };
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return await prisma.user.create({ data });
  }

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
}

function mapRole(role: string): Role {
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
}

function mapPermission(permission: string): Permission {
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
}
