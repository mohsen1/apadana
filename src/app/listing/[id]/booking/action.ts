'use server';

/**
 * @fileoverview
 * Actions for booking requests and bookings. This file include the following actions:
 *
 * - Get a booking request
 * - Alter a booking request
 * - Create a booking request
 * - Get booking requests
 * - Update a booking
 * - Cancel a booking
 */

import { BookingStatus } from '@prisma/client';
import { addDays, eachDayOfInterval } from 'date-fns';

import resend from '@/lib/email/resend';
import { sendBookingAlterationEmail, sendBookingRequestEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { getUserEmail } from '@/lib/prisma/utils';
import { actionClient, ClientVisibleError, UnauthorizedError } from '@/lib/safe-action';
import {
  AlterBookingRequestSchema,
  CancelBookingSchema,
  CreateBookingRequestSchema,
  GetBookingRequestSchema,
  GetBookingRequestsSchema,
  UpdateBookingSchema,
} from '@/lib/schema';

import { BookingAlterationEmail } from '@/components/emails/BookingAlterationEmail';

import logger from '@/utils/logger';

export const getBookingRequest = actionClient
  .schema(GetBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx?.user?.id) {
      throw new UnauthorizedError();
    }

    const bookingRequest = await prisma.bookingRequest.findUnique({
      where: { id: parsedInput.id },
      include: {
        listing: {
          include: {
            images: true,
            owner: {
              include: {
                emailAddresses: true,
              },
            },
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
      throw new UnauthorizedError();
    }

    if (bookingRequest.userId !== ctx.user.id) {
      throw new UnauthorizedError('You are not authorized to view this booking request');
    }

    return bookingRequest;
  });

/**
 * Alter a booking request
 *
 * This action creates a new booking request as an alteration of the original booking request
 * and updates the original booking request to be altered
 */
export const alterBookingRequest = actionClient
  .schema(AlterBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx?.user?.id) {
      throw new UnauthorizedError();
    }

    try {
      const originalRequest = await prisma.bookingRequest.findUnique({
        where: { id: parsedInput.bookingRequestId },
        include: { listing: true },
      });

      if (!originalRequest) {
        throw new ClientVisibleError('Original booking request not found');
      }

      if (originalRequest.userId !== ctx.user.id) {
        throw new UnauthorizedError('Unauthorized to alter this booking request');
      }

      if (originalRequest.status !== 'PENDING') {
        throw new ClientVisibleError('Cannot alter a booking that is not pending');
      }

      // Create new booking request as an alteration
      const alteredRequest = await prisma.bookingRequest.create({
        data: {
          listingId: originalRequest.listingId,
          userId: ctx.user.id,
          checkIn: parsedInput.checkIn,
          checkOut: parsedInput.checkOut,
          guests: parsedInput.guestCount,
          message: parsedInput.message ?? '',
          status: 'PENDING',
          alterationOf: originalRequest.id,
          pets: originalRequest.pets,
          totalPrice: 0,
        },
        include: {
          listing: true,
          user: true,
        },
      });

      // Update original request status
      await prisma.bookingRequest.update({
        where: { id: originalRequest.id },
        data: { status: 'ALTERED' },
      });

      return alteredRequest;
    } catch (error) {
      logger.error('Failed to alter booking request:', error);
      throw error;
    }
  });

/**
 * Create a booking request
 *
 * This action creates a new booking request and sends an email to the host
 */
export const createBookingRequest = actionClient
  .schema(CreateBookingRequestSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { listingId, checkIn, checkOut, guests, pets, message } = parsedInput;

    if (!ctx.user?.id) {
      throw new UnauthorizedError('Guest not found');
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
          guestName: `${ctx.user.firstName ?? ''} ${ctx.user.lastName ?? ''}`.trim(),
          listingTitle: listing.title,
          checkIn,
          checkOut,
          guests,
          totalPrice,
          currency: listing.currency,
          listingId: listing.id,
        });
      } catch (error) {
        logger.error('Failed to send booking request email:', error);
        // Continue even if email fails
      }
    }

    return bookingRequest;
  });

/**
 * Get booking requests
 *
 * This action gets booking requests based on the provided filters
 */
export const getBookingRequests = actionClient
  .schema(GetBookingRequestsSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx?.userId) {
      throw new UnauthorizedError();
    }

    const { take, skip, status, include, listingId } = parsedInput;
    return prisma.bookingRequest.findMany({
      take,
      skip,
      include: include || {
        user: true,
      },
      where: {
        AND: [{ status }, { listingId }],
      },
    });
  });

/**
 * Update a booking
 *
 * This action updates a booking and sends an email to the host
 */
export const updateBooking = actionClient
  .schema(UpdateBookingSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id, checkIn, checkOut } = parsedInput;

      // Add date validation
      if (checkIn >= checkOut) {
        throw new ClientVisibleError('Check-out date must be after check-in date');
      }

      const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: {
          listingInventory: {
            include: {
              listing: {
                include: {
                  owner: true,
                },
              },
            },
          },
          user: true,
        },
      });

      if (!existingBooking) {
        throw new ClientVisibleError('Booking not found');
      }

      if (existingBooking.status === BookingStatus.CANCELLED) {
        throw new ClientVisibleError('Cannot update a cancelled booking');
      }

      if (
        existingBooking.status === BookingStatus.ACCEPTED &&
        parsedInput.status === BookingStatus.PENDING
      ) {
        throw new ClientVisibleError('Cannot change booking status backwards');
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          checkIn,
          checkOut,
        },
        include: {
          bookingRequest: {
            include: {
              user: true,
            },
          },
          listingInventory: {
            include: {
              listing: {
                include: {
                  owner: {
                    include: {
                      emailAddresses: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            include: {
              emailAddresses: true,
            },
          },
        },
      });

      const hostEmail = getUserEmail(updatedBooking?.listingInventory?.at(0)?.listing?.owner);

      if (!hostEmail) {
        throw new ClientVisibleError('Host email not found');
      }

      // Send email notification
      try {
        await sendBookingAlterationEmail({
          hostEmail,
          guestName:
            `${updatedBooking.user.firstName ?? ''} ${updatedBooking.user.lastName ?? ''}`.trim(),
          listingTitle: updatedBooking.listingInventory[0].listing.title,
          startDate: updatedBooking.checkIn,
          endDate: updatedBooking.checkOut,
        });
      } catch (error) {
        logger.error('Failed to send booking modification email', error);
      }

      return { success: true, booking: updatedBooking };
    } catch (error) {
      logger.error('Failed to update booking', error);
      throw error;
    }
  });

/**
 * Cancel a booking
 *
 * This action cancels a booking and sends an email to the guest
 */
export const cancelBooking = actionClient
  .schema(CancelBookingSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { bookingId } = parsedInput;

      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
        },
        include: {
          listingInventory: {
            include: {
              listing: true,
            },
          },
          user: {
            include: {
              emailAddresses: true,
            },
          },
        },
      });

      // Send cancellation email
      try {
        const userEmail = getUserEmail(booking.user);
        if (userEmail) {
          await resend.emails.send({
            from: 'bookings@apadana.app',
            to: userEmail,
            subject: `Booking Cancelled - ${booking.listingInventory[0].listing.title}`,
            react: BookingAlterationEmail({
              listingTitle: booking.listingInventory[0].listing.title,
              startDate: booking.checkIn,
              endDate: booking.checkOut,
              guestName: `${booking.user.firstName ?? ''} ${booking.user.lastName ?? ''}`.trim(),
              alterationType: 'cancelled',
            }),
          });
        }
      } catch (error) {
        logger.error('Failed to send booking cancellation email', error);
      }

      return { success: true, booking };
    } catch (error) {
      logger.error('Failed to cancel booking', error);
      throw error;
    }
  });
