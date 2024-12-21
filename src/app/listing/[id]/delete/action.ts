'use server';

import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError, UnauthorizedError } from '@/lib/safe-action';

import { getListing } from '@/app/listing/action';

export const deleteListing = actionClient
  .schema(z.object({ id: z.string() }))
  .outputSchema(z.object({ listing: z.literal(null) }))
  .action(async ({ parsedInput, ctx }) => {
    const { id: listingId } = parsedInput;
    const { userId } = ctx;

    if (!userId) {
      throw new UnauthorizedError();
    }
    const res = await getListing({ id: listingId });

    if (!res?.data?.listing) {
      throw new ClientVisibleError('Listing Not Found');
    }

    const listing = res.data.listing;

    if (listing.ownerId !== userId) {
      throw new UnauthorizedError();
    }

    await prisma.$transaction(async (tx) => {
      // Delete associated images
      await tx.uploadedPhoto.deleteMany({
        where: { listingId },
      });

      // Delete related booking requests
      await tx.bookingRequest.deleteMany({
        where: { listingId },
      });

      // Delete listing inventory
      await tx.listingInventory.deleteMany({
        where: { listingId },
      });

      // Finally, delete the listing
      await tx.listing.delete({
        where: { id: listingId },
      });
    });

    return {
      listing: null,
    };
  });
