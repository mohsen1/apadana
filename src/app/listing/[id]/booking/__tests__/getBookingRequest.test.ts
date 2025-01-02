import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getUserInServer as mockGetUserInServer } from '@/lib/auth';
import prisma from '@/lib/prisma/client';

import { cleanupTest, setupTestUsers, TestSetup } from './test-setup';
import { getBookingRequest } from '../action';

vi.mock('@/lib/auth', () => ({
  getUserInServer: vi.fn(),
  setServerSession: vi.fn(),
}));

describe('getBookingRequest', () => {
  let setup: TestSetup;
  let bookingRequestId: string;

  beforeEach(async () => {
    setup = await setupTestUsers();

    const br = await prisma.bookingRequest.create({
      data: {
        listingId: setup.listing.id,
        checkIn: new Date('2030-01-10'),
        checkOut: new Date('2030-01-12'),
        guests: 2,
        pets: false,
        message: 'Just checking',
        totalPrice: 200,
        userId: setup.guestUser.id,
      },
    });
    bookingRequestId = br.id;
  });

  afterEach(async () => {
    await cleanupTest();
  });

  test('retrieves booking request if user owns it', async () => {
    vi.mocked(mockGetUserInServer).mockResolvedValue({
      ...setup.guestUser,
      emailAddresses: [],
      roles: [],
      permissions: [],
    });
    const result = await getBookingRequest({ id: bookingRequestId });

    expect(result?.serverError).toBeUndefined();
    expect(result?.data?.id).toBe(bookingRequestId);
    expect(result?.data?.listingId).toBe(setup.listing.id);
  });

  // Add other getBookingRequest tests...
});
