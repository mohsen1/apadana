'use server';

import prisma from '@/lib/prisma/client';
import { CreateBookingSchema } from '@/lib/prisma/schema';
import { actionClient } from '@/lib/safe-action';

import { assertError } from '@/utils';

function dateDiffInDays(checkIn: Date, checkOut: Date) {
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export const createBooking = actionClient
  .schema(CreateBookingSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const { listingId, checkIn, checkOut } = parsedInput;

    if (!userId) {
      throw new Error('User not found');
    }
    try {
      return await prisma.$transaction(async (prisma) => {
        // Check availability
        const availableDays = await prisma.listingInventory.findMany({
          where: {
            listingId: listingId,

            date: {
              gte: checkIn,
              lt: checkOut,
            },
            isAvailable: true,
          },
        });

        if (availableDays.length !== dateDiffInDays(checkIn, checkOut)) {
          throw new Error('Listing is not available for the selected dates');
        }

        // Calculate total price
        const totalPrice = availableDays.reduce(
          (sum, day) => sum + day.price,
          0,
        );

        // Create booking
        const booking = await prisma.booking.create({
          data: {
            userId: userId,
            totalPrice: totalPrice,
            checkIn: checkIn,
            checkOut: checkOut,
            listingInventory: {
              connect: availableDays.map((day) => ({ id: day.id })),
            },
          },
        });

        // Update listing inventory
        await prisma.listingInventory.updateMany({
          where: {
            id: {
              in: availableDays.map((day) => day.id),
            },
          },
          data: {
            isAvailable: false,
            bookingId: booking.id,
          },
        });

        return { success: true, booking };
      });
    } catch (error) {
      assertError(error);
      return { success: false, error: error.message };
    }
  });
