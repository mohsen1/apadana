import { BookingRequestStatus } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getUserInServer } from '@/lib/auth';
import prisma from '@/lib/prisma/client';

import { cleanupTest, setupTestUsers, TestSetup } from './test-setup';
import { getBookingRequests } from '../action';

vi.mock('@/lib/auth', () => ({
  getUserInServer: vi.fn(),
  setServerSession: vi.fn(),
}));

describe('getBookingRequests', () => {
  let setup: TestSetup;

  beforeEach(async () => {
    setup = await setupTestUsers();

    // Create multiple booking requests for testing
    const dates = [
      {
        checkIn: new Date('2030-02-01'),
        checkOut: new Date('2030-02-02'),
        status: BookingRequestStatus.PENDING,
      },
      {
        checkIn: new Date('2030-02-03'),
        checkOut: new Date('2030-02-04'),
        status: BookingRequestStatus.ACCEPTED,
      },
      {
        checkIn: new Date('2030-02-05'),
        checkOut: new Date('2030-02-06'),
        status: BookingRequestStatus.REJECTED,
      },
    ];

    for (const d of dates) {
      await prisma.bookingRequest.create({
        data: {
          listingId: setup.listing.id,
          checkIn: d.checkIn,
          checkOut: d.checkOut,
          guests: 2,
          pets: false,
          message: 'Test',
          totalPrice: 100,
          userId: setup.guestUser.id,
          status: d.status,
        },
      });
    }
  });

  afterEach(async () => {
    await cleanupTest();
  });

  test('retrieves booking requests by status', async () => {
    vi.mocked(getUserInServer).mockResolvedValue(setup.hostUser);

    const results = await getBookingRequests({
      take: 10,
      skip: 0,
      listingId: setup.listing.id,
      status: BookingRequestStatus.PENDING,
    });

    expect(results).toBeDefined();
    expect(results?.serverError?.error).toBeUndefined();
    expect(results?.data?.length).toBe(1);
    expect(results?.data?.[0]?.status).toBe(BookingRequestStatus.PENDING);
  });
});
