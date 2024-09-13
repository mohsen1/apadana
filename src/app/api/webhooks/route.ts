import { clerkClient, UserJSON, WebhookEvent } from '@clerk/nextjs/server';
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

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
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
    return new Response('Error occured verifying webhook', {
      status: 400,
    });
  }

  if (!evt.data.id) {
    return new Response('No user id was provided', {
      status: 400,
    });
  }

  // In development, we need to create the user in the database when an
  // existing user is logging in. They have a row in the production database
  // but not in the development database. We use the session.created webhook
  // to detect this and create the user in the development database.
  if (
    evt.type === 'session.created' &&
    process.env.NODE_ENV === 'development'
  ) {
    // Somehow Clerk types is not accurate. User does have those extra properties
    const clerkUser = (await clerkClient().users.getUser(
      evt.data.user_id,
    )) as unknown as ClerkUserComplete;
    const createArg = await clerkUserToUserCreateArgsData(clerkUser);
    await prisma.user.upsert({
      where: { id: clerkUser.id },
      update: createArg,
      create: createArg,
    });
    return new Response('Webhook received', { status: 200 });
  }

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    await createOrUpdateUser(evt.data as UserJSON);
  }

  return new Response('Webhook received', { status: 200 });
}

interface ClerkUserComplete extends ClerkUser {
  primaryEmailAddressId: string;
  emailAddresses: Omit<ClerkEmailAddress, 'isPrimary'>[];
  externalAccounts: ClerkExternalAccount[];
}

async function clerkUserToUserCreateArgsData(
  clerkUser: ClerkUserComplete,
): Promise<Prisma.UserCreateArgs['data']> {
  const orgMemberships =
    await clerkClient().users.getOrganizationMembershipList({
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
    // TODO: update permissions when creating a user object from clerk user
    //  in webhooks in development
    // permissions:
  };
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

  const data: Prisma.UserCreateArgs['data'] = {
    id: userId,
    firstName: userJson.first_name,
    lastName: userJson.last_name,
    imageUrl: userJson.image_url,
    externalAccounts: {
      create: userJson.external_accounts
        .filter(
          (externalAccount) =>
            externalAccount.id &&
            externalAccount.provider &&
            externalAccount.provider_user_id,
        )
        .map((account) => ({
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
      create: userJson.email_addresses.map((email) => ({
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
