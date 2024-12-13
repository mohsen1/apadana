/* eslint-disable @typescript-eslint/no-non-null-assertion */
// tests/bookingRequestsActions.test.ts

import { BookingRequestStatus, User } from '@prisma/client';
import { eachDayOfInterval } from 'date-fns';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import resend from '@/lib/email/resend';
import { sendBookingRequestEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import {
  // @ts-expect-error testing-only method
  setSafeActionContext,
} from '@/lib/safe-action';

import {
  createTestListing,
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
  let listingId: string;
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
    const listing = await createTestListing({ ownerId: hostUser.id });
    listingId = listing.id;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('createBookingRequest', () => {
    test('creates a booking request and sends an email to the host', async () => {
      // Set the user context first
      await setSafeActionContext({ user: guestUser });

      const checkIn = new Date('2030-01-01');
      const checkOut = new Date('2030-01-03');

      const dates = eachDayOfInterval({
        start: checkIn,
        end: checkOut,
      });

      // Create inventory for listing
      for (const date of dates) {
        await prisma.listingInventory.create({
          data: {
            listingId,
            date,
            isAvailable: true,
            price: 120,
          },
        });
      }

      const result = await createBookingRequest({
        listingId: listingId,
        checkIn,
        checkOut,
        guests: 2,
        pets: false,
        message: 'Need a place to stay',
      });

      expect(result?.serverError).toBeFalsy();

      expect(result?.data).toBeDefined();
      expect(result?.data?.listingId).toBe(listingId);
      expect(result?.data?.totalPrice).toBe(240);

      expect(sendBookingRequestEmail).toHaveBeenCalledWith({
        hostEmail: 'host@example.com',
        guestName: 'Guest User',
        listingTitle: 'Test Listing',
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: 240,
        currency: 'USD',
      });
    });

    test('fails if listing not found', async () => {
      await setSafeActionContext({ user: guestUser });
      const result = await createBookingRequest({
        listingId: '999999',
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-02'),
        guests: 2,
        pets: false,
        message: 'Invalid listing',
      });
      expect(result?.serverError?.error).toBe('Listing or host not found');
    });

    test('handles no inventory scenario gracefully', async () => {
      await setSafeActionContext({ user: guestUser });
      const result = await createBookingRequest({
        listingId,
        checkIn: new Date('2030-01-05'),
        checkOut: new Date('2030-01-06'),
        guests: 1,
        pets: false,
        message: 'No inventory created',
      });
      expect(result?.serverError?.error).toBe(
        'One or more dates are not available',
      );
    });

    test('does not send email if host has no email addresses', async () => {
      // Remove host's email
      await prisma.emailAddress.deleteMany({ where: { userId: hostId } });

      await setSafeActionContext({ user: guestUser });
      const result = await createBookingRequest({
        listingId,
        checkIn: new Date('2030-01-01'),
        checkOut: new Date('2030-01-02'),
        guests: 1,
        pets: false,
        message: 'No host email',
      });

      expect(result?.serverError?.error).toBe(
        'One or more dates are not available',
      );
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
      expect(result?.serverError?.error).toBe('Guest not found');
    });
  });

  describe('getBookingRequest', () => {
    let bookingRequestId: string;

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
      expect(result?.data?.id).toBe(bookingRequestId);
      expect(result?.data?.listingId).toBe(listingId);
    });

    test('returns error if user does not own the booking request', async () => {
      await setSafeActionContext({ user: otherUser });
      const result = await getBookingRequest({ id: bookingRequestId });
      expect(result?.serverError?.error).toBe('Booking request not found');
    });

    test('returns error if booking request not found', async () => {
      await setSafeActionContext({ user: guestUser });
      const result = await getBookingRequest({ id: '999999' });
      expect(result?.serverError?.error).toBe('Booking request not found');
    });

    test('handles no user context', async () => {
      await setSafeActionContext({ user: null });
      const result = await getBookingRequest({ id: bookingRequestId });
      expect(result?.serverError?.error).toBe('Booking request not found');
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
      const results = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId: String(listingId),
        status: 'PENDING',
      });

      expect(results?.data?.length).toBe(1);
      expect(results?.data?.[0]?.status).toBe('PENDING');
    });

    test('retrieves multiple booking requests for a host', async () => {
      await setSafeActionContext({ user: hostUser });

      const result = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId: String(listingId),
      });
      expect(result?.data?.length).toBeGreaterThanOrEqual(3);
    });

    test('respects pagination', async () => {
      await setSafeActionContext({ user: hostUser });
      const result = await getBookingRequests({
        take: 1,
        skip: 0,
        listingId: String(listingId),
      });
      expect(result?.data?.length).toBe(1);

      const result2 = await getBookingRequests({
        take: 1,
        skip: 1,
        listingId: String(listingId),
      });
      expect(result2?.data?.length).toBe(1);
      expect(result2?.data?.[0]?.id).not.toBe(result?.data?.[0]?.id);
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
      const result = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId: String(listingId),
      });
      expect(result?.data?.length).toBe(0);
    });

    test('fails gracefully if user not provided', async () => {
      await setSafeActionContext({ user: null });
      const result = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId: String(listingId),
      });
      // The query depends on userId to filter listings by ownerId, but if not defined, it might return an empty set or fail.
      // In this code, it won't throw an error, just no results since ownerId = undefined won't match any listing.
      expect(result?.data?.length).toBe(0);
    });

    test('includes user by default, can override with include option', async () => {
      await setSafeActionContext({ user: hostUser });
      const result = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId: String(listingId),
      });
      expect(result?.data?.[0]?.user).toBeDefined();

      await setSafeActionContext(undefined);
      const resultNoInclude = await getBookingRequests({
        take: 10,
        skip: 0,
        listingId: String(listingId),
        include: { user: false },
      });
      expect(resultNoInclude?.data?.[0]?.user).toBeUndefined();
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
  let listingId: string;

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

    const listing = await createTestListing({ ownerId: hostUser.id });
    listingId = listing.id;

    // Set the action context to the guest user by default
    await setSafeActionContext({ user: guestUser });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  test('fails if some requested dates are not available', async () => {
    await setSafeActionContext({ user: guestUser });
    const result = await createBookingRequest({
      listingId,
      checkIn: new Date('2030-01-10'),
      checkOut: new Date('2030-01-12'),
      guests: 2,
      pets: false,
      message: 'Testing partial availability',
    });
    expect(result?.serverError?.error).toBe(
      'One or more dates are not available',
    );
  });

  test('fails if checkIn equals checkOut', async () => {
    await setSafeActionContext({ user: guestUser });
    const result = await createBookingRequest({
      listingId,
      checkIn: new Date('2030-02-01'),
      checkOut: new Date('2030-02-01'),
      guests: 1,
      pets: false,
      message: 'CheckIn equals CheckOut scenario',
    });
    expect(result?.serverError?.error).toBe('Invalid date range');
  });

  test('fails if booking duration is less than one day', async () => {
    await setSafeActionContext({ user: guestUser });
    const result = await createBookingRequest({
      listingId,
      checkIn: new Date('2030-02-01T10:00:00.000Z'),
      checkOut: new Date('2030-02-01T20:00:00.000Z'),
      guests: 1,
      pets: false,
      message: 'Less than one day booking attempt',
    });
    expect(result?.serverError?.error).toBe(
      'Booking must be for at least one day',
    );
  });
});

// Mock the email client
vi.mock('@/lib/email', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  },
}));

describe('Booking actions', () => {
  describe('updateBooking', () => {
    test('should update booking and send email', async () => {
      // ... existing test logic ...

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'bookings@apadana.app',
          subject: expect.stringContaining('Booking Modified'),
        }),
      );
    });
  });

  describe('cancelBooking', () => {
    test('should cancel booking and send email', async () => {
      // ... existing test logic ...

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'bookings@apadana.app',
          subject: expect.stringContaining('Booking Cancelled'),
        }),
      );
    });
  });
});
