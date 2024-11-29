'use server';

import { sendBookingRequestEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import {
  CreateBookingRequestSchema,
  GetBookingRequestSchema,
  GetBookingRequestsSchema,
} from '@/lib/prisma/schema';
import { actionClient } from '@/lib/safe-action';

import { assertError } from '@/utils';

export const getBookingRequest = actionClient
  .schema(GetBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { id } = parsedInput;
      const bookingRequest = await prisma.bookingRequest.findUnique({
        where: {
          id,
          userId: String(ctx.userId),
        },
        include: {
          listing: {
            include: {
              images: true,
              owner: true,
              inventory: true,
            },
          },
          user: {
            include: {
              emailAddresses: true,
            },
          },
        },
      });
      return {
        success: true,
        data: bookingRequest,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

export const createBookingRequest = actionClient
  .schema(CreateBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { listingId, checkIn, checkOut, guests, pets, message } =
        parsedInput;

      // Get the listing and host details
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          owner: {
            include: {
              emailAddresses: true,
            },
          },
        },
      });

      if (!listing || !listing.owner) {
        throw new Error('Listing or host not found');
      }

      // Get guest details
      const guest = await prisma.user.findUnique({
        where: { id: String(ctx.userId) },
      });

      if (!guest) {
        throw new Error('Guest not found');
      }

      const inventoryForDates = await prisma.listingInventory.findMany({
        where: {
          date: {
            gte: checkIn,
            lte: checkOut,
          },
        },
      });

      const totalPrice = inventoryForDates.reduce((acc, inventory) => {
        return acc + inventory.price;
      }, 0);

      const bookingRequest = await prisma.bookingRequest.create({
        data: {
          listingId,
          checkIn,
          checkOut,
          guests,
          pets,
          message,
          totalPrice,
          userId: String(ctx.userId),
        },
      });

      // Send email to host
      const hostEmail = listing.owner.emailAddresses[0]?.emailAddress;
      if (hostEmail) {
        await sendBookingRequestEmail({
          hostEmail,
          guestName: `${guest.firstName} ${guest.lastName}`,
          listingTitle: listing.title,
          checkIn,
          checkOut,
          guests,
          totalPrice,
          currency: listing.currency,
        });
      }

      return {
        success: true,
        data: bookingRequest,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

export const getBookingRequests = actionClient
  .schema(GetBookingRequestsSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { take, skip, status, include } = parsedInput;
      const bookingRequests = await prisma.bookingRequest.findMany({
        take,
        skip,
        include: include || {
          user: true,
        },
        where: {
          status,
          listing: {
            ownerId: {
              equals: String(ctx.userId),
            },
          },
        },
      });
      return {
        success: true,
        data: bookingRequests,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
