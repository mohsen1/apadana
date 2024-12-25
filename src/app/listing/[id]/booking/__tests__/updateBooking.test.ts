import { BookingStatus } from '@prisma/client';
import { addDays } from 'date-fns';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { sendBookingAlterationEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';

import {
  createTestBooking,
  createTestBookingRequest,
  createTestListing,
  findOrCreateTestUser,
} from '@/__tests__/setup/fixtures';
import { clearDatabase } from '@/__tests__/setup/test-container';

import { updateBooking } from '../action';

// Mock email sending functionality
vi.mock('@/lib/email/send-email', () => ({
  sendBookingAlterationEmail: vi.fn(),
}));

describe('updateBooking', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test('successfully updates a booking', async () => {
    // Setup test data
    const user = await findOrCreateTestUser('test@example.com', {
      firstName: 'Test',
      lastName: 'User',
    });

    const owner = await findOrCreateTestUser('owner@example.com', {
      firstName: 'Owner',
      lastName: 'User',
    });

    const listing = await createTestListing({
      ownerId: owner.id, // Use the actual owner's ID
      published: true,
    });

    // Create inventory for the listing
    const inventory = await prisma.listingInventory.create({
      data: {
        listingId: listing.id,
        date: new Date(),
        isAvailable: true,
        price: 100,
      },
    });

    // Create a booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        checkIn: new Date(),
        checkOut: addDays(new Date(), 2),
        totalPrice: 200,
        listingInventory: {
          connect: [{ id: inventory.id }],
        },
      },
    });

    // Test the update
    const newCheckIn = addDays(new Date(), 1);
    const newCheckOut = addDays(new Date(), 3);

    const result = await updateBooking({
      ...booking,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
    });

    // Assertions
    expect(result?.data?.success).toBe(true);
    expect(result?.data?.booking?.checkIn).toEqual(newCheckIn);
    expect(result?.data?.booking?.checkOut).toEqual(newCheckOut);
    expect(sendBookingAlterationEmail).toHaveBeenCalled();
  });

  test('returns error when booking not found', async () => {
    const result = await updateBooking({
      id: 'non-existent-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user-id',
      bookingRequestId: 'test-booking-request-id',
      status: 'PENDING',
      totalPrice: 100,
      checkIn: new Date(),
      checkOut: addDays(new Date(), 1),
    });

    expect(result?.serverError?.error).toContain('Booking not found');
  });

  test('validates date range', async () => {
    const user = await findOrCreateTestUser('test@example.com');
    const owner = await findOrCreateTestUser('owner@example.com');
    const listing = await createTestListing({ ownerId: owner.id });

    const inventory = await prisma.listingInventory.create({
      data: {
        listingId: listing.id,
        date: new Date(),
        isAvailable: true,
        price: 100,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        checkIn: new Date(),
        checkOut: addDays(new Date(), 2),
        totalPrice: 200,
        listingInventory: {
          connect: [{ id: inventory.id }],
        },
      },
    });

    // Try to update with invalid date range (checkOut before checkIn)
    const result = await updateBooking({
      ...booking,
      checkIn: addDays(new Date(), 2),
      checkOut: addDays(new Date(), 1),
    });

    expect(result?.serverError?.error).toContain('Check-out date must be after check-in date');
  });

  test('prevents booking status from going backwards', async () => {
    // Setup test data
    const user = await findOrCreateTestUser('test@example.com');
    const owner = await findOrCreateTestUser('owner@example.com');
    const listing = await createTestListing({ ownerId: owner.id });

    const bookingRequest = await createTestBookingRequest({
      listingId: listing.id,
      userId: user.id,
    });

    // Create a ACCEPTED booking
    const booking = await createTestBooking({
      status: BookingStatus.ACCEPTED,
      checkIn: new Date(),
      checkOut: addDays(new Date(), 2),
      totalPrice: 200,
      user: {
        connect: { id: user.id },
      },
      bookingRequestId: bookingRequest.id,
    });

    // Attempt to update the booking status to PENDING
    const result = await updateBooking({
      ...booking,
      status: BookingStatus.PENDING,
    });

    expect(result?.serverError?.error).toContain('Cannot change booking status backwards');
  });
});
