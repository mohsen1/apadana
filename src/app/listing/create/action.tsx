'use server';

import slugify from 'slugify';

import { getTimeZone } from '@/lib/google-maps-api';
import prisma from '@/lib/prisma/client';
import { CreateListingSchema } from '@/lib/prisma/schema';
import { actionClient } from '@/lib/safe-action';

import { assertError } from '@/utils/index';
import logger from '@/utils/logger';

export const createListing = actionClient
  .schema(CreateListingSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    logger.info('createListing', { parsedInput, userId });
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
      const timeZone = await getTimeZone(
        parsedInput.latitude,
        parsedInput.longitude,
      );
      const listing = await prisma.listing.create({
        data: {
          ...parsedInput,
          slug: slugify(parsedInput.title),
          timeZone,
          owner: {
            connect: {
              id: owner.id,
            },
          },
          images: {
            connectOrCreate: (parsedInput.images || []).map((image) => ({
              where: { key: image.key },
              create: image,
            })),
          },
        },
      });

      return { success: true, listing };
    } catch (error) {
      assertError(error);
      return { success: false, error: error.message };
    }
  });
