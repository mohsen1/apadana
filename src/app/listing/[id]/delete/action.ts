import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

import { getListing } from '@/app/listing/action';

export const deleteListing = actionClient
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;
    const { userId } = ctx;

    if (!userId) {
      return {
        error: 'Unauthorized',
      };
    }

    if (typeof id === 'string') {
      const listingId = parseInt(id, 10);
      const res = await getListing({ id: listingId });

      if (!res?.data?.success) {
        throw new Error(res?.data?.error);
      }

      const listing = res.data.listing;

      if (!listing) {
        return {
          error: 'Listing Not Found',
        };
      }

      if (listing.ownerId !== userId) {
        return {
          error: 'Listing Not Found',
        };
      }

      await prisma.$transaction(async (tx) => {
        // Delete associated images
        await tx.uploadThingImage.deleteMany({
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
        success: true,
      };
    }

    return {
      error: 'Invalid ID',
    };
  });
