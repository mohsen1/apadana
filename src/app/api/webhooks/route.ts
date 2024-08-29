import { UserJSON, WebhookEvent } from '@clerk/nextjs/server';
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

  return new Response('Webhook received', { status: 200 });
}

/**
 * Create or update a user in the database
 * @param userJson The user data from the webhook
 */
async function createOrUpdateUser(userJson: UserJSON) {
  const clerkId = userJson.id;

  if (!clerkId) {
    throw new Error('No Clerk ID provided');
  }

  const data = {
    clerkId,
    firstName: userJson.first_name,
    lastName: userJson.last_name,
    imageUrl: userJson.image_url,
    externalAccounts: {
      create: userJson.external_accounts.map((account) => ({
        provider: account.provider,
        externalId: account.provider_user_id,
        userId: clerkId,
      })),
    },
    emailAddresses: {
      create: userJson.email_addresses.map((email) => ({
        emailAddress: email.email_address,
        userId: clerkId,
        verificationStatus: email.verification?.status ?? 'unverified',
        isPrimary: email.object === 'email_address',
      })),
    },
  };

  const user = await prisma.user.findFirst({
    where: {
      clerkId,
    },
  });

  if (!user) {
    return await prisma.user.create({ data });
  }

  return await prisma.user.update({
    where: {
      clerkId,
    },
    data,
  });
}
