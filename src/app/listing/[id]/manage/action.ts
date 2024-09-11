'use server';
import prisma from '@/lib/prisma/client';
import {
  EditInventorySchema,
  EditListingSchema,
  GetListingSchema,
} from '@/lib/prisma/schema';
import { actionClient } from '@/lib/safe-action';
import { setToStartOfDayInTimeZone } from '@/lib/utils';

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

      const inventory = parsedInput.inventory.map((item) => ({
        ...item,
        date: setToStartOfDayInTimeZone(item.date, listing.timeZone),
      }));

      await prisma.$transaction(async (tx) => {
        // first remove inventories with the same date
        await tx.listingInventory.deleteMany({
          where: {
            listingId: listing.id,
            date: {
              in: inventory.map((item) => item.date),
            },
          },
        });
        // make sure inventory for those dates are deleted

        await tx.listingInventory.createMany({
          data: inventory.map((item) => ({
            ...item,
            listingId: listing.id,
          })),
        });
        const newInventoryCount = await tx.listingInventory.count({
          where: {
            listingId: listing.id,
            date: {
              in: inventory.map((item) => new Date(item.date)),
            },
          },
        });
        if (newInventoryCount !== inventory.length) {
          throw new Error('Failed to update inventory');
        }
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
