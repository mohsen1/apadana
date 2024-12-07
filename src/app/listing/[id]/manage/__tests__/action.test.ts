// tests/getBookings.test.ts

import { afterEach } from 'node:test';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import prisma from '@/lib/prisma/client';

import { findOrCreateTestUser } from '@/__tests__/setup/fixtures';
import { clearDatabase } from '@/__tests__/setup/test-container';

import { getBookings } from '../action';

vi.mock('@/lib/safe-action');

describe('getBookings action', async () => {
  let userId: string | null;
  let otherUserId: string;
  let listingId: number;
  let otherListingId: number;

  beforeEach(async () => {
    const userA = await findOrCreateTestUser('test@example.com');
    const userB = await findOrCreateTestUser('jane@example.com');

    userId = userA.id;
    otherUserId = userB.id;

    // Create listings for each user
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

    listingId = listingA.id;
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
  });

  test('fails if listing does not exist or user does not own it', async () => {
    const result = await getBookings({ listingId: 9999999 });
    expect(result?.data?.success).toBe(false);
    expect(result?.data?.error).toMatch(/Listing not found/);

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
});
