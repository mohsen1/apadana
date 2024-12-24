'use server';
import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError } from '@/lib/safe-action';
import { GetListingSchema } from '@/lib/schema';

export const getListing = actionClient
  .schema(GetListingSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    if (!userId) {
      throw new ClientVisibleError('User not found');
    }
    const listing = await prisma.listing.findUnique({
      where: {
        id: parsedInput.id,
        ownerId: userId,
      },
      include: {
        inventory: true,
        owner: true,
        images: true,
      },
    });

    return {
      listing,
    };
  });
