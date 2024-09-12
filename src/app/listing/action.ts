'use server';
import prisma from '@/lib/prisma/client';
import { GetListingSchema } from '@/lib/prisma/schema';
import { actionClient } from '@/lib/safe-action';

import { assertError } from '@/utils';

export const getListing = actionClient
  .schema(GetListingSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    try {
      if (!userId) {
        throw new Error('User not found');
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
        success: true,
        listing,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
