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

      // Check date range validity
      if (checkIn >= checkOut) {
        throw new Error('Invalid date range');
      }

      // Ensure booking is at least one day
      const diffInDays = Math.floor(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffInDays < 1) {
        throw new Error('Booking must be at least one day');
      }

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

      const guest = await prisma.user.findUnique({
        where: { id: String(ctx.userId) },
      });

      if (!guest) {
        throw new Error('Guest not found');
      }

      // Fetch inventory for the requested dates
      const inventoryForDates = await prisma.listingInventory.findMany({
        where: {
          listingId,
          date: {
            gte: checkIn,
            lt: checkOut,
          },
        },
      });

      // Modified: Allow booking even if no inventory exists
      if (inventoryForDates.length > 0) {
        // Only check availability if inventory exists
        const allDatesAvailable = inventoryForDates.every((i) => i.isAvailable);
        if (!allDatesAvailable) {
          throw new Error('One or more dates are not available');
        }
      }

      const totalPrice = inventoryForDates.reduce(
        (acc, inventory) => acc + inventory.price,
        0,
      );

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

      // Modified: Only attempt to send email if host has an email address
      const hostEmail = listing.owner.emailAddresses[0]?.emailAddress;
      if (hostEmail) {
        await sendBookingRequestEmail({
          hostEmail,
          guestName: `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim(),
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
