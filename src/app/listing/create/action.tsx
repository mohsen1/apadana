'use server';

import slugify from 'slugify';
import { z } from 'zod';

import { getTimeZone } from '@/lib/google-maps-api';
import prisma from '@/lib/prisma/client';
import { actionClient, UnauthorizedError } from '@/lib/safe-action';
import { CreateListingSchema, GetListingSchema } from '@/lib/schema';

import logger from '@/utils/logger';

export const createListing = actionClient
  .schema(CreateListingSchema)
  .outputSchema(z.object({ listing: GetListingSchema }))
  .action(async ({ parsedInput, ctx: { userId } }) => {
    if (!userId) {
      throw new UnauthorizedError();
    }
    const owner = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!owner) {
      throw new Error('Owner not found');
    }
    if (
      parsedInput.latitude === undefined ||
      parsedInput.latitude === null ||
      parsedInput.longitude === undefined ||
      parsedInput.longitude === null
    ) {
      throw new Error('Latitude and longitude are required');
    }
    const timeZone = await getTimeZone(parsedInput.latitude, parsedInput.longitude);
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
          connectOrCreate: (parsedInput.images || [])
            .filter((image) => image?.key)
            .map((image) => ({
              where: { key: image.key },
              create: image,
            })),
        },
      },
    });

    logger.info('created listing', { listing });

    return { listing };
  });
