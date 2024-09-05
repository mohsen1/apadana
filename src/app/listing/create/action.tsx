'use server';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

import { CreateListingSchema } from '@/app/listing/create/schema';
import { assertError } from '@/utils/index';

export const createListing = actionClient
  .schema(CreateListingSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    try {
      if (!userId) {
        throw new Error('User not found');
      }
      const owner = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!owner) {
        throw new Error('Owner not found');
      }
      const listing = await prisma.listing.create({
        data: {
          ...parsedInput,
          owner: {
            connect: {
              id: owner.id,
            },
          },
          images: {
            createMany: {
              data: (parsedInput.images || []).map((image) => ({
                url: image.url,
                key: image.key,
                name: image.name,
              })),
            },
          },
        },
      });

      return { success: true, listing };
    } catch (error) {
      assertError(error);
      return { success: false, error: error.message };
    }
  });
