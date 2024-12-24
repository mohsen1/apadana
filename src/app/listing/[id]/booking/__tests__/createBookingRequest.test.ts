import { eachDayOfInterval } from 'date-fns';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getUserInServer } from '@/lib/auth';
import prisma from '@/lib/prisma/client';

import { cleanupTest, setupTestUsers, TestSetup } from './test-setup';
import { createBookingRequest } from '../action';

vi.mock('@/lib/email/send-email', () => ({
  sendBookingRequestEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEarlyAccessEmail: vi.fn(),
  sendBookingAlterationEmail: vi.fn(),
}));

import { sendBookingRequestEmail } from '@/lib/email/send-email';

vi.mock('@/lib/auth', () => ({
  getUserInServer: vi.fn(),
  setServerSession: vi.fn(),
}));

describe('createBookingRequest', () => {
  let setup: TestSetup;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    setup = await setupTestUsers();
  });

  afterEach(async () => {
    await cleanupTest();
  });

  test('creates a booking request and sends an email to the host', async () => {
    vi.mocked(getUserInServer).mockResolvedValue(setup.guestUser);

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
          listingId: setup.listing.id,
          date,
          isAvailable: true,
          price: 120,
        },
      });
    }

    const result = await createBookingRequest({
      listingId: setup.listing.id,
      checkIn,
      checkOut,
      guests: 2,
      pets: false,
      message: 'Need a place to stay',
    });

    expect(result?.serverError?.error).toBeFalsy();
    expect(result?.data).toBeDefined();
    expect(result?.data?.listingId).toBe(setup.listing.id);
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
});
