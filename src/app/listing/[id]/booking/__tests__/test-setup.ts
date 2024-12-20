import { expect, vi } from 'vitest';

import {
  createTestListing,
  findOrCreateTestUser,
} from '@/__tests__/setup/fixtures';
import { clearDatabase } from '@/__tests__/setup/test-container';

vi.mock('@/lib/email/send-email', () => ({
  sendBookingRequestEmail: vi.fn(),
}));

vi.mock('@/lib/email/send-email', () => ({
  sendBookingRequestEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEarlyAccessEmail: vi.fn(),
  sendBookingAlterationEmail: vi.fn(),
}));

vi.mock('@/lib/email/resend', () => ({
  default: {
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  },
}));

export async function setupTestUsers() {
  const guestUser = await findOrCreateTestUser('guest@example.com', {
    firstName: 'Guest',
    lastName: 'User',
  });

  const hostUser = await findOrCreateTestUser('host@example.com', {
    firstName: 'Host',
    lastName: 'Owner',
  });

  const otherUser = await findOrCreateTestUser('other@example.com');

  const listing = await createTestListing({ ownerId: hostUser.id });

  // const booking = await createTestBooking({
  //   userId: guestUser.id,
  //   listingId: listing.id,
  // });

  expect(guestUser.id).not.toBeNull();
  expect(hostUser.id).not.toBeNull();
  expect(otherUser.id).not.toBeNull();
  expect(listing.id).not.toBeNull();

  // expect(booking.id).not.toBeNull();

  return {
    guestUser,
    hostUser,
    otherUser,
    listing,

    // booking,
  };
}

export type TestSetup = Awaited<ReturnType<typeof setupTestUsers>>;

export async function cleanupTest() {
  await clearDatabase();
}
