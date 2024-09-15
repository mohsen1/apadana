'use server';

import { format, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import prisma from '@/lib/prisma/client';
import {
  ChangeBookingRequestStatusSchema,
  EditInventorySchema,
  EditListingSchema,
  GetBookingsSchema,
  GetListingsSchema,
} from '@/lib/prisma/schema';
import { actionClient } from '@/lib/safe-action';

import { assertError } from '@/utils';

export const getBookings = actionClient
  .schema(GetBookingsSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    try {
      if (!userId) {
        throw new Error('User not found');
      }

      // Verify that the listing exists and is owned by the user
      const listing = await prisma.listing.findUnique({
        where: {
          id: parsedInput.listingId,
          ownerId: userId,
        },
      });

      if (!listing) {
        throw new Error('Listing not found or you do not have access to it');
      }

      // Fetch all bookings associated with the listing
      const bookings = await prisma.booking.findMany({
        where: {
          listingInventory: {
            some: {
              listingId: parsedInput.listingId,
            },
          },
        },
        include: {
          listingInventory: true,
          user: true,
          bookingRequest: true,
        },
      });

      return {
        success: true,
        bookings,
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

      const inventory = parsedInput.inventory.map((item) => {
        // Combine the inventory date with the listing's check-in time
        const dateStr = `${format(item.date, 'yyyy-MM-dd')} ${listing.checkInTime}`;
        const dateWithCheckInTime = parse(
          dateStr,
          'yyyy-MM-dd HH:mm',
          toZonedTime(new Date(), listing.timeZone),
        );
        // Convert the datetime to ISO string
        const dateInUTC = toZonedTime(
          dateWithCheckInTime,
          listing.timeZone,
        ).toISOString();

        return {
          ...item,
          date: dateInUTC,
        };
      });

      await prisma.$transaction(async (tx) => {
        // Remove existing inventories with the same check-in datetime
        await tx.listingInventory.deleteMany({
          where: {
            listingId: listing.id,
            date: {
              in: inventory.map((item) => item.date),
            },
          },
        });

        // Insert the new inventory entries
        await tx.listingInventory.createMany({
          data: inventory.map((item) => ({
            ...item,
            listingId: listing.id,
          })),
        });

        // Verify that all inventory entries were created
        const newInventoryCount = await tx.listingInventory.count({
          where: {
            listingId: listing.id,
            date: {
              in: inventory.map((item) => item.date),
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

/**
 * Get all listings for the user
 */
export const getListings = actionClient
  .schema(GetListingsSchema)
  .action(async ({ parsedInput: { take, skip }, ctx: { userId } }) => {
    try {
      const listings = await prisma.listing.findMany({
        where: {
          ownerId: String(userId),
        },
        take: take,
        skip: skip,
        include: {
          images: true,
        },
      });
      const totalCount = await prisma.listing.count();
      return {
        success: true,
        listings,
        totalCount,
      };
    } catch (error) {
      assertError(error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

/**
 * Used in the management dashboard to accept or reject booking requests
 * Once booking request is accepted, we create a booking and remove the days
 * from the inventory.
 * If booking request is rejected, we remove the booking and release the days
 * from the inventory in case booking request was accepted before.
 */
export const changeBookingRequestStatus = actionClient
  .schema(ChangeBookingRequestStatusSchema)
  .action(
    async ({ parsedInput: { bookingRequestId, status }, ctx: { userId } }) => {
      try {
        if (!userId) {
          throw new Error('User not found');
        }

        const bookingRequest = await prisma.bookingRequest.findUnique({
          where: {
            id: Number(bookingRequestId),
          },
          include: {
            listing: true,
          },
        });

        if (!bookingRequest || bookingRequest.listing.ownerId !== userId) {
          throw new Error(
            'Booking request not found or you are not the owner of the listing',
          );
        }

        const previousStatus = bookingRequest.status;

        await prisma.$transaction(async (prisma) => {
          // Update the booking request status
          await prisma.bookingRequest.update({
            where: {
              id: Number(bookingRequestId),
            },
            data: {
              status,
            },
          });

          if (status === 'ACCEPTED' && previousStatus !== 'ACCEPTED') {
            // Create a booking
            const booking = await prisma.booking.create({
              data: {
                userId: bookingRequest.userId,
                totalPrice: 0, // We'll calculate this below
                checkIn: bookingRequest.checkIn,
                checkOut: bookingRequest.checkOut,
                bookingRequestId: bookingRequest.id,
              },
            });

            // Generate dates between checkIn and checkOut (excluding checkOut)
            const dates = [];
            const currentDate = new Date(bookingRequest.checkIn);
            while (currentDate < bookingRequest.checkOut) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }

            let totalPrice = 0;
            for (const date of dates) {
              // Check if the date is available
              const inventory = await prisma.listingInventory.findUnique({
                where: {
                  listingId_date: {
                    listingId: bookingRequest.listingId,
                    date,
                  },
                },
              });

              if (inventory) {
                if (!inventory.isAvailable) {
                  throw new Error(
                    `Date ${date.toISOString().split('T')[0]} is not available`,
                  );
                }
                // Update the inventory
                await prisma.listingInventory.update({
                  where: {
                    id: inventory.id,
                  },
                  data: {
                    isAvailable: false,
                    bookingId: booking.id,
                  },
                });
                totalPrice += inventory.price;
              } else {
                // Create new inventory entry
                const newInventory = await prisma.listingInventory.create({
                  data: {
                    listingId: bookingRequest.listingId,
                    date,
                    isAvailable: false,
                    price: bookingRequest.listing.pricePerNight,
                    bookingId: booking.id,
                  },
                });
                totalPrice += newInventory.price;
              }
            }

            // Update the total price of the booking
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                totalPrice,
              },
            });
          } else if (previousStatus === 'ACCEPTED' && status !== 'ACCEPTED') {
            // Cancel the booking
            const booking = await prisma.booking.findFirst({
              where: {
                bookingRequestId: bookingRequest.id,
              },
              include: {
                listingInventory: true,
              },
            });

            if (booking) {
              // Release inventory
              for (const inventory of booking.listingInventory) {
                await prisma.listingInventory.update({
                  where: { id: inventory.id },
                  data: {
                    isAvailable: true,
                    bookingId: null,
                  },
                });
              }

              // Delete the booking
              await prisma.booking.delete({
                where: { id: booking.id },
              });
            }
          }
        });

        return {
          success: true,
          status,
        };
      } catch (error) {
        assertError(error);
        return {
          success: false,
          error: error.message,
        };
      }
    },
  );
