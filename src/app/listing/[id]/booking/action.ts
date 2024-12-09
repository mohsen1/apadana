'use server';

import { addDays, eachDayOfInterval } from 'date-fns';

import { sendBookingRequestEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import {
  CreateBookingRequestSchema,
  GetBookingRequestSchema,
  GetBookingRequestsSchema,
} from '@/lib/prisma/schema';
import {
  actionClient,
  ClientVisibleError,
  UnauthorizedError,
} from '@/lib/safe-action';

import logger from '@/utils/logger';

export const getBookingRequest = actionClient
  .schema(GetBookingRequestSchema)
  .outputSchema(GetBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
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

    if (!bookingRequest) {
      throw new ClientVisibleError('Booking request not found');
    }

    return bookingRequest;
  });

export const createBookingRequest = actionClient
  .schema(CreateBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { listingId, checkIn, checkOut, guests, pets, message } = parsedInput;

    if (!ctx.user?.id) {
      throw new UnauthorizedError('Guest not found');
    }

    // Get listing and verify it exists and is published
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        published: true,
        currency: true,
        amenities: true,
        owner: {
          select: {
            emailAddresses: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!listing) {
      throw new ClientVisibleError('Listing or host not found');
    }

    if (!listing.published) {
      throw new ClientVisibleError('Listing is not published');
    }

    // Validate date range
    if (checkIn >= checkOut) {
      throw new ClientVisibleError('Invalid date range');
    }

    if (checkOut.getTime() - checkIn.getTime() < 24 * 60 * 60 * 1000) {
      throw new ClientVisibleError('Booking must be for at least one day');
    }

    // Get available dates and calculate total price
    const dates = eachDayOfInterval({
      start: checkIn,
      end: addDays(checkOut, -1),
    });
    const inventory = await prisma.listingInventory.findMany({
      where: {
        listingId,
        date: { in: dates },
        isAvailable: true,
      },
    });

    // Verify all dates are available
    if (inventory.length !== dates.length) {
      throw new ClientVisibleError('One or more dates are not available');
    }

    const totalPrice = inventory.reduce((sum, inv) => sum + inv.price, 0);

    // Create booking request with the listing's current currency
    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        listingId,
        userId: ctx.user.id,
        checkIn,
        checkOut,
        guests,
        pets,
        message,
        totalPrice,
      },
      include: {
        listing: true,
        user: true,
      },
    });

    // Only attempt to send email if host has an email address
    const hostEmail = listing.owner.emailAddresses[0]?.emailAddress;
    if (hostEmail) {
      try {
        await sendBookingRequestEmail({
          hostEmail,
          guestName:
            `${ctx.user.firstName ?? ''} ${ctx.user.lastName ?? ''}`.trim(),
          listingTitle: listing.title,
          checkIn,
          checkOut,
          guests,
          totalPrice,
          currency: listing.currency,
        });
      } catch (error) {
        logger.error('Failed to send booking request email:', error);
        // Continue even if email fails
      }
    }

    return bookingRequest;
  });

export const getBookingRequests = actionClient
  .schema(GetBookingRequestsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { take, skip, status, include } = parsedInput;
    return prisma.bookingRequest.findMany({
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
  });
