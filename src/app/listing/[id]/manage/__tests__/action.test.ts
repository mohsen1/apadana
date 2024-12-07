// tests/getBookings.test.ts

import { afterEach } from 'node:test';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import prisma from '@/lib/prisma/client';
import {
  // @ts-expect-error test
  setSafeActionContext,
} from '@/lib/safe-action';

import { findOrCreateTestUser } from '@/__tests__/setup/fixtures';
import { clearDatabase } from '@/__tests__/setup/test-container';

import { getBookings } from '../action';

vi.mock('@/lib/safe-action');

describe('getBookings action', async () => {
  let userId: string;
  let otherUserId: string;
  let listingId: number;
  let otherListingId: number;

  beforeEach(async () => {
    // Clear DB first
    await clearDatabase();

    // Create users
    const userA = await findOrCreateTestUser('test@example.com');
    const userB = await findOrCreateTestUser('jane@example.com');

    userId = userA.id;
    otherUserId = userB.id;

    // Set auth context for tests
    await setSafeActionContext({
      user: userA,
    });

    // Create listings
    const listingA = await prisma.listing.create({
      data: {
        title: 'Nice Apartment',
        description: 'A lovely place',
        propertyType: 'apartment',
        address: '123 Main St',
        pricePerNight: 100,
        houseRules: 'No pets',
        ownerId: userId,
      },
    });
    listingId = listingA.id;

    // Create listings for each user
    const listingB = await prisma.listing.create({
      data: {
        title: 'Beach House',
        description: 'A place by the sea',
        propertyType: 'house',
        address: '456 Ocean Dr',
        pricePerNight: 200,
        houseRules: 'No pets',
        ownerId: otherUserId,
      },
    });

    otherListingId = listingB.id;

    // Create inventory for listing
    const inventoryDay1 = await prisma.listingInventory.create({
      data: {
        listingId: listingId,
        date: new Date('2030-01-01'),
        isAvailable: true,
        price: 100,
      },
    });
    const inventoryDay2 = await prisma.listingInventory.create({
      data: {
        listingId: listingId,
        date: new Date('2030-01-02'),
        isAvailable: true,
        price: 100,
      },
    });

    // Create a user booking request and a booking
    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        userId: userId,
        listingId: listingId,
        message: 'Need a stay',
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-03'),
        guests: 2,
        status: 'ACCEPTED',
        totalPrice: 200,
      },
    });

    await prisma.booking.create({
      data: {
        userId: userId,
        totalPrice: 200,
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-03'),
        bookingRequestId: bookingRequest.id,
        listingInventory: {
          connect: [{ id: inventoryDay1.id }, { id: inventoryDay2.id }],
        },
      },
    });

    // Create another booking request and booking for userB’s listing (not accessible by userA)
    const bookingRequestB = await prisma.bookingRequest.create({
      data: {
        userId: otherUserId,
        listingId: otherListingId,
        message: 'Another stay',
        checkIn: new Date('2030-02-01'),
        checkOut: new Date('2030-02-02'),
        guests: 2,
        status: 'ACCEPTED',
        totalPrice: 200,
      },
    });

    const inventoryDayB = await prisma.listingInventory.create({
      data: {
        listingId: otherListingId,
        date: new Date('2030-02-01'),
        isAvailable: true,
        price: 200,
      },
    });

    await prisma.booking.create({
      data: {
        userId: otherUserId,
        totalPrice: 200,
        checkIn: new Date('2030-02-01'),
        checkOut: new Date('2030-02-02'),
        bookingRequestId: bookingRequestB.id,
        listingInventory: {
          connect: [{ id: inventoryDayB.id }],
        },
      },
    });
  });

  afterEach(async () => {
    await clearDatabase();
    // Reset auth context
    await setSafeActionContext(undefined);
  });

  test('fails if user is not logged in', async () => {
    await setSafeActionContext({
      user: null,
    });
    const result = await getBookings({ listingId });
    expect(result?.data?.success).toBe(false);
    expect(result?.data?.error).toMatch(/User not found/);

    // reset the context
    await setSafeActionContext(undefined);
  });

  test('fails if listing does not exist or user does not own it', async () => {
    // Clear auth context first
    await setSafeActionContext(undefined);

    const result = await getBookings({ listingId: 9999999 });
    expect(result?.data?.success).toBe(false);
    expect(result?.data?.error).toMatch(
      /Listing not found or you do not have access/,
    );

    // Set auth context back
    await setSafeActionContext({
      user: { id: userId },
    });

    const result2 = await getBookings({ listingId: otherListingId });
    expect(result2?.data?.success).toBe(false);
    expect(result2?.data?.error).toMatch(/do not have access/);
  });

  test('returns bookings for a listing owned by the user', async () => {
    const result = await getBookings({ listingId });

    expect(result?.serverError).toBeFalsy();

    expect(result?.data).toBeTruthy();

    expect(result?.data?.bookings?.length).toBe(1);

    const booking = result?.data?.bookings?.[0];
    expect(booking?.userId).toEqual(userId);
    expect(booking?.listingInventory.length).toBe(2);
    expect(booking?.bookingRequest).toBeDefined();
    expect(booking?.bookingRequest?.listingId).toBe(listingId);
  });

  test('returns empty array if no bookings are found for a valid listing owned by the user', async () => {
    // Create a new listing owned by the user with no bookings
    const newListing = await prisma.listing.create({
      data: {
        title: 'Empty Listing',
        description: 'No bookings here',
        propertyType: 'apartment',
        address: '789 Lonely Road',
        pricePerNight: 50,
        houseRules: 'Be quiet',
        ownerId: userId,
      },
    });

    const result = await getBookings({ listingId: newListing.id });
    expect(result?.data?.success).toBe(true);
    expect(result?.data?.bookings?.length).toBe(0);
  });

  test('ignores bookings from other users listings', async () => {
    // Confirm we only see bookings belonging to user’s listing, not the otherUserId listing
    const result = await getBookings({ listingId });
    expect(result?.data?.success).toBe(true);
    const bookings = result?.data?.bookings;
    expect(
      bookings?.every((b) =>
        b.listingInventory.every((inv) => inv.listingId === listingId),
      ),
    ).toBe(true);
  });

  test('verifies booking data structure', async () => {
    const result = await getBookings({ listingId });
    const booking = result?.data?.bookings?.[0];
    expect(booking).toHaveProperty('userId');
    expect(booking).toHaveProperty('listingInventory');
    expect(booking).toHaveProperty('bookingRequest');
    expect(booking?.bookingRequest).toHaveProperty('checkIn');
    expect(booking?.bookingRequest).toHaveProperty('checkOut');
    expect(booking?.bookingRequest).toHaveProperty('status');
  });

  test('handles large number of bookings (stress test)', async () => {
    // Add multiple bookings for the same listing
    for (let i = 0; i < 5; i++) {
      const invDate = new Date(`2031-01-0${i + 1}`);
      const inv = await prisma.listingInventory.create({
        data: {
          listingId: listingId,
          date: invDate,
          isAvailable: true,
          price: 100,
        },
      });

      const br = await prisma.bookingRequest.create({
        data: {
          userId: userId,
          listingId: listingId,
          message: `Stay ${i}`,
          checkIn: invDate,
          checkOut: new Date(`2031-01-0${i + 2}`),
          guests: 2,
          status: 'ACCEPTED',
          totalPrice: 100,
        },
      });

      await prisma.booking.create({
        data: {
          userId: userId,
          totalPrice: 100,
          checkIn: invDate,
          checkOut: new Date(`2031-01-0${i + 2}`),
          bookingRequestId: br.id,
          listingInventory: {
            connect: [{ id: inv.id }],
          },
        },
      });
    }

    const result = await getBookings({ listingId });
    expect(result?.data?.success).toBe(true);
    expect(result?.data?.bookings?.length).toBeGreaterThanOrEqual(6);
  });

  test('ensures booking requests that are not accepted are not returned as bookings', async () => {
    await prisma.listingInventory.create({
      data: {
        listingId: listingId,
        date: new Date('2032-01-01'),
        isAvailable: true,
        price: 100,
      },
    });

    await prisma.bookingRequest.create({
      data: {
        userId: userId,
        listingId: listingId,
        message: 'Pending request',
        checkIn: new Date('2032-01-01'),
        checkOut: new Date('2032-01-02'),
        guests: 2,
        status: 'PENDING',
        totalPrice: 100,
      },
    });
    const result = await getBookings({ listingId });
    // Should not include pending requests because no booking is created yet
    expect(
      result?.data?.bookings?.some(
        (b) => b.bookingRequest?.status === 'PENDING',
      ),
    ).toBe(false);
  });

  test('verifies serverError property remains false in normal operations', async () => {
    const result = await getBookings({ listingId });
    expect(result?.serverError).toBeFalsy();
  });

  test('checks error messages return a string when listing is invalid', async () => {
    const result = await getBookings({ listingId: 123456789 });
    expect(typeof result?.data?.error).toBe('string');
  });
});
