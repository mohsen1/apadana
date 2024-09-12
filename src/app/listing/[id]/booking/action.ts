'use server';

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
      const bookingRequest = await prisma.bookingRequest.create({
        data: {
          listingId,
          checkIn,
          checkOut,
          guests,
          pets,
          message,
          userId: String(ctx.userId),
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
