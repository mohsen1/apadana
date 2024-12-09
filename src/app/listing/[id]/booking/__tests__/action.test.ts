// tests/bookingRequestsActions.test.ts

import { BookingRequestStatus, User } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { sendBookingRequestEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import {
  // @ts-expect-error testing-only method
  setSafeActionContext,
} from '@/lib/safe-action';

import {
  createListing,
  findOrCreateTestUser,
} from '@/__tests__/setup/fixtures';
import { clearDatabase } from '@/__tests__/setup/test-container';

import {
  createBookingRequest,
  getBookingRequest,
  getBookingRequests,
} from '../action';

vi.mock('@/lib/safe-action');
vi.mock('@/lib/email/send-email', () => ({
  sendBookingRequestEmail: vi.fn(),
}));

describe('Booking Requests Actions', () => {
  let userId: string;
  // let user: User;
  let guestUser: User;
  let hostUser: User;
  let otherUser: User;
  let listingId: number;
  let hostId: string;
  const currency = 'USD';

  beforeEach(async () => {
    await setSafeActionContext(undefined);

    // Create user as a guest
    guestUser = await findOrCreateTestUser('guest@example.com', {
      firstName: 'Guest',
      lastName: 'User',
    });
    userId = guestUser.id;

    // Create another user as a host
    hostUser = await findOrCreateTestUser('host@example.com', {
      firstName: 'Host',
      lastName: 'Owner',
    });
    hostId = hostUser.id;

    // Create a third user to test unauthorized access
    otherUser = await findOrCreateTestUser('other@example.com');

    // Create a listing for the host
    const listing = await createListing({ hostId });
    listingId = listing.id;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('createBookingRequest', () => {
    test('creates a booking request and sends an email to the host', async () => {
      const checkIn = new Date('2030-01-01');
      const checkOut = new Date('2030-01-03');
      const days = [checkIn, new Date('2030-01-02')];

      // Create inventory for listing
      for (const d of days) {
        await prisma.listingInventory.create({
          data: {
            listingId,
            date: d,
            isAvailable: true,
            price: 120,
          },
        });
      }

      const result = await createBookingRequest({
        listingId,
        checkIn,
        checkOut,
        guests: 2,
        pets: false,
        message: 'Need a place to stay',
      });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.data?.listingId).toBe(listingId);

      // Check totalPrice calculation
      expect(result?.data?.data?.totalPrice).toBe(240);

      // Check email sending
      expect(sendBookingRequestEmail).toHaveBeenCalledWith({
        hostEmail: 'host@example.com',
        guestName: 'Test User',
        listingTitle: 'Test Listing',
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: 240,
        currency: 'USD',
      });
    });

    test('fails if listing not found', async () => {
      const result = await createBookingRequest({
        listingId: 999999,
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-02'),
        guests: 2,
        pets: false,
        message: 'Invalid listing',
      });

      expect(result?.data?.success).toBe(false);
      expect(result?.data?.error).toMatch(/Listing or host not found/);
    });

    test('handles no inventory scenario gracefully (total price = 0)', async () => {
      const checkIn = new Date('2030-01-05');
      const checkOut = new Date('2030-01-06');

      const result = await createBookingRequest({
        listingId,
        checkIn,
        checkOut,
        guests: 1,
        pets: false,
        message: 'No inventory created',
      });

      expect(result?.data?.success).toBe(true);
      expect(result?.data?.data?.totalPrice).toBe(0);
    });

    test('does not send email if host has no email addresses', async () => {
      // Remove host's email
      await prisma.emailAddress.deleteMany({ where: { userId: hostId } });

      const checkIn = new Date('2030-01-01');
      const checkOut = new Date('2030-01-02');

      const result = await createBookingRequest({
        listingId,
        checkIn,
        checkOut,
        guests: 1,
        pets: false,
        message: 'No host email',
      });

      expect(result?.data?.success).toBe(true);
      expect(sendBookingRequestEmail).not.toHaveBeenCalled();
    });

    test('fails when user is not authenticated', async () => {
      await setSafeActionContext({ user: null });

      const result = await createBookingRequest({
        listingId,
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-02'),
        guests: 2,
        pets: false,
        message: 'Should fail',
      });

      expect(result?.data?.success).toBe(false);
      expect(result?.data?.error).toMatch(/Guest not found/);
    });
  });

  describe('getBookingRequest', () => {
    let bookingRequestId: number;

    beforeEach(async () => {
      const br = await prisma.bookingRequest.create({
        data: {
          listingId,
          checkIn: new Date('2030-01-10'),
          checkOut: new Date('2030-01-12'),
          guests: 2,
          pets: false,
          message: 'Just checking',
          totalPrice: 200,
          userId,
        },
      });
      bookingRequestId = br.id;
    });

    test('retrieves booking request if user owns it', async () => {
      await setSafeActionContext({ user: guestUser });

      const result = await getBookingRequest({ id: bookingRequestId });
      expect(result?.data?.success).toBe(true);
      expect(result?.data?.data?.id).toBe(bookingRequestId);
      expect(result?.data?.data?.listing?.id).toBe(listingId);
    });

    test('fails if user does not own the booking request', async () => {
      await setSafeActionContext(undefined);
      await setSafeActionContext({ user: otherUser });
      const result = await getBookingRequest({ id: bookingRequestId });
      expect(result?.data?.success).toBe(true);
      // If user doesn't own it, findUnique with userId condition won't return it
      // So data should be null
      expect(result?.data?.data).toBeNull();

      // reset the context
      await setSafeActionContext(undefined);
    });

    test('fails gracefully if booking request not found', async () => {
      await setSafeActionContext(undefined);
      const result = await getBookingRequest({ id: 999999 });
      expect(result?.data?.success).toBe(true);
      expect(result?.data?.data).toBeNull();
    });

    test('handles no user context', async () => {
      await setSafeActionContext({ user: null });
      const result = await getBookingRequest({ id: bookingRequestId });
      expect(result?.data?.success).toBe(true);
      // Without userId, we can't match the booking
      expect(result?.data?.data).toBeNull();

      // reset the context
      await setSafeActionContext(undefined);
    });
  });

  describe('getBookingRequests', () => {
    beforeEach(async () => {
      // Create multiple booking requests for testing
      const dates = [
        {
          checkIn: new Date('2030-02-01'),
          checkOut: new Date('2030-02-02'),
          status: 'PENDING',
        },
        {
          checkIn: new Date('2030-02-03'),
          checkOut: new Date('2030-02-04'),
          status: 'ACCEPTED',
        },
        {
          checkIn: new Date('2030-02-05'),
          checkOut: new Date('2030-02-06'),
          status: 'REJECTED',
        },
      ];
      for (const d of dates) {
        await prisma.bookingRequest.create({
          data: {
            listingId,
            checkIn: d.checkIn,
            checkOut: d.checkOut,
            guests: 2,
            pets: false,
            message: 'Test',
            totalPrice: 100,
            userId, // same user, but listing belongs to hostId
            status: d.status as BookingRequestStatus,
          },
        });
      }
    });

    test('retrieves booking requests by status', async () => {
      await setSafeActionContext({ user: hostUser });
      const result = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId,
        status: 'PENDING',
      });
      expect(result?.data?.success).toBe(true);
      const data = result?.data?.data;
      expect(data?.length).toBe(1);
      expect(data?.[0]?.status).toBe('PENDING');
    });

    test('retrieves multiple booking requests for a host', async () => {
      await setSafeActionContext({ user: hostUser });

      const result = await getBookingRequests({ take: 10, skip: 0, listingId });
      expect(result?.data?.success).toBe(true);
      const data = result?.data?.data;
      expect(data?.length).toBeGreaterThanOrEqual(3);
    });

    test('respects pagination', async () => {
      await setSafeActionContext({ user: hostUser });
      const result = await getBookingRequests({ take: 1, skip: 0, listingId });
      expect(result?.data?.success).toBe(true);
      const data = result?.data?.data;
      expect(data?.length).toBe(1);

      const result2 = await getBookingRequests({ take: 1, skip: 1, listingId });
      expect(result2?.data?.success).toBe(true);
      const data2 = result2?.data?.data;
      expect(data2?.length).toBe(1);
      expect(data2?.[0]?.id).not.toBe(data?.[0]?.id);
    });

    test('returns empty array if no booking requests found', async () => {
      // Use a listing owned by another user that has no booking requests
      await prisma.listing.create({
        data: {
          title: 'No Requests Listing',
          description: 'Empty',
          propertyType: 'apartment',
          address: 'No St',
          pricePerNight: 100,
          currency,
          houseRules: 'No rules',
          ownerId: otherUser.id,
        },
      });

      await setSafeActionContext({ user: otherUser });
      const result = await getBookingRequests({ take: 10, skip: 0, listingId });
      expect(result?.data?.success).toBe(true);
      // This user’s listing has no booking requests
      expect(result?.data?.data?.length).toBe(0);
    });

    test('fails gracefully if user not provided', async () => {
      await setSafeActionContext({ user: null });
      const result = await getBookingRequests({ take: 10, skip: 0, listingId });
      // The query depends on userId to filter listings by ownerId, but if not defined, it might return an empty set or fail.
      // In this code, it won't throw an error, just no results since ownerId = undefined won't match any listing.
      expect(result?.data?.success).toBe(true);
      expect(result?.data?.data?.length).toBe(0);
    });

    test('includes user by default, can override with include option', async () => {
      await setSafeActionContext({ user: hostUser });
      const result = await getBookingRequests({ take: 10, skip: 0, listingId });
      expect(result?.data?.success).toBe(true);
      expect(result?.data?.data?.[0]?.user).toBeDefined();

      await setSafeActionContext(undefined);
      const resultNoInclude = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId,
        include: { user: false },
      });
      expect(resultNoInclude?.data?.success).toBe(true);
      expect(resultNoInclude?.data?.data?.[0]?.user).toBeUndefined();
    });
  });
});

vi.mock('@/lib/safe-action');
vi.mock('@/lib/email/send-email', () => ({
  sendBookingRequestEmail: vi.fn(),
}));

describe('Booking Requests Edge Cases', () => {
  let guestUser: User;
  let hostUser: User;
  let listingId: number;

  beforeEach(async () => {
    await setSafeActionContext(undefined);

    guestUser = await findOrCreateTestUser('guest-edge@example.com', {
      firstName: 'Guest',
      lastName: 'Edge',
    });
    hostUser = await findOrCreateTestUser('host-edge@example.com', {
      firstName: 'Host',
      lastName: 'Edge',
    });

    const listing = await createListing({ hostId: hostUser.id });
    listingId = listing.id;

    // Set the action context to the guest user by default
    await setSafeActionContext({ user: guestUser });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  test('fails if some requested dates are not available', async () => {
    // Dates: Jan 10, Jan 11, Jan 12
    const checkIn = new Date('2030-01-10T00:00:00.000Z');
    const checkOut = new Date('2030-01-12T00:00:00.000Z');

    // Create inventory:
    // Jan 10 is available, price 100
    await prisma.listingInventory.create({
      data: {
        listingId,
        date: checkIn,
        isAvailable: true,
        price: 100,
      },
    });
    // Jan 11 is NOT available
    await prisma.listingInventory.create({
      data: {
        listingId,
        date: new Date('2030-01-11T00:00:00.000Z'),
        isAvailable: false,
        price: 120, // price should not matter if unavailable
      },
    });
    // Jan 12 is available, price 100
    await prisma.listingInventory.create({
      data: {
        listingId,
        date: checkOut,
        isAvailable: true,
        price: 100,
      },
    });

    // Attempt to create a booking request spanning Jan 10 - Jan 12
    // Expected: should fail because one of the days (Jan 11) is not available.
    const result = await createBookingRequest({
      listingId,
      checkIn,
      checkOut,
      guests: 2,
      pets: false,
      message: 'Testing partial availability',
    });

    // Assuming the desired behavior is to reject the entire request if any day is unavailable.
    // If the code does not yet implement this logic, this test will fail until implemented.
    expect(result?.data?.success).toBe(false);
    expect(result?.data?.error).toMatch(/One or more dates are not available/);
  });

  test('fails if checkIn equals checkOut', async () => {
    // Invalid scenario: same checkIn and checkOut date
    const checkIn = new Date('2030-02-01T00:00:00.000Z');
    const checkOut = new Date('2030-02-01T00:00:00.000Z'); // same as checkIn

    const result = await createBookingRequest({
      listingId,
      checkIn,
      checkOut,
      guests: 1,
      pets: false,
      message: 'CheckIn equals CheckOut scenario',
    });

    // Expect a failure due to invalid date range
    expect(result?.data?.success).toBe(false);
    expect(result?.data?.error).toMatch(/Invalid date range/);
  });

  test('fails if booking duration is less than one day', async () => {
    // Set checkout to be less than 24 hours after checkin
    const checkIn = new Date('2030-02-01T10:00:00.000Z');
    const checkOut = new Date('2030-02-01T20:00:00.000Z'); // Only 10 hours later

    const result = await createBookingRequest({
      listingId,
      checkIn,
      checkOut,
      guests: 1,
      pets: false,
      message: 'Less than one day booking attempt',
    });

    expect(result?.data?.success).toBe(false);
    expect(result?.data?.error).toMatch(/Booking must be at least one day/);
  });
});
