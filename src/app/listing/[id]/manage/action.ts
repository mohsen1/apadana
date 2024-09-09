'use server';
import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

import {
  EditInventorySchema,
  EditListingSchema,
  GetListingSchema,
} from '@/app/listing/create/schema';
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

export const editListing = actionClient
  .schema(EditListingSchema)
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
      });
      if (!listing) {
        throw new Error('Listing not found');
      }
      await prisma.listing.update({
        where: {
          id: listing.id,
        },
        data: parsedInput,
      });

      return {
        success: true,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

export const editInventory = actionClient
  .schema(EditInventorySchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    try {
      if (!userId) {
        throw new Error('User not found');
      }
      const listing = await prisma.listing.findUnique({
        where: {
          id: parsedInput.listingId,
          ownerId: userId,
        },
      });
      if (!listing) {
        throw new Error('Listing not found');
      }
      const { inventory } = parsedInput;
      await prisma.listing.update({
        where: {
          id: listing.id,
        },
        data: {
          inventory: {
            create: inventory.map((item) => ({
              date: item.date,
              isBooked: item.isBooked,
              price: item.price,
              bookingId: item.bookingId,
            })),
          },
        },
      });
      return {
        success: true,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
