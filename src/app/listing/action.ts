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
    const listing = await prisma.listing.findFirst({
      where: {
        AND: [
          { id: parsedInput.id },
          {
            OR: [
              // Allow owners to view their own listings (published or unpublished)
              { ownerId: userId },
              // Allow any authenticated user to view published listings
              { published: true },
            ],
          },
        ],
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
