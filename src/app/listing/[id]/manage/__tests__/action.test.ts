import { PrismaClient } from '@prisma/client';
import { format as formatDate, parse as parseDate } from 'date-fns';
import { toZonedTime as toZonedTimeImport } from 'date-fns-tz';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  vi,
} from 'vitest';

import { getBookings } from '../action';

// Create a new PrismaClient instance for testing
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

const mockUserId = 'user_123';

// Mock date-fns functions
const format = vi.fn() as Mock<typeof formatDate>;
const parse = vi.fn() as Mock<typeof parseDate>;
const toZonedTime = vi.fn() as Mock<typeof toZonedTimeImport>;

vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn(),
}));

vi.mock('@/lib/safe-action', () => {
  const mockActionClient = {
    schema: (_schema: unknown) => ({
      action:
        (
          fn: (args: {
            parsedInput: unknown;
            ctx: { userId?: string };
          }) => unknown,
        ) =>
        async (input: { parsedInput: unknown; ctx: { userId?: string } }) => {
          return fn(input);
        },
    }),
  };
  return { actionClient: mockActionClient };
});

vi.mock('@/utils', () => ({
  assertError: vi.fn((err) => err),
}));

describe('Actions Integration Tests', () => {
  beforeAll(async () => {
    // Setup the test database
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear all tables before each test
    await prisma.$transaction([
      prisma.listingInventory.deleteMany(),
      prisma.uploadedPhoto.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.bookingRequest.deleteMany(),
      prisma.listing.deleteMany(),
    ]);

    // Setup date mocks
    format.mockImplementation(() => '2023-01-01');
    parse.mockImplementation(() => new Date('2023-01-01T14:00:00Z'));
    toZonedTime.mockImplementation(() => new Date('2023-01-01T14:00:00Z'));
  });

  describe('getBookings', () => {
    it('fails if no userId in context', async () => {
      const result = await getBookings({
        parsedInput: { listingId: 1 },
        ctx: {},
      });
      expect(result?.success).toBe(false);
      expect(result?.error).toMatch(/User not found/);
    });

    it('fails if listing not owned by user', async () => {
      // Create a listing owned by a different user
      await prisma.listing.create({
        data: {
          id: 1,
          ownerId: 'different_user',
          title: 'Test Listing',
        },
      });

      const result = await getBookings({
        parsedInput: { listingId: 1 },
        ctx: { userId: mockUserId },
      });

      expect(result?.success).toBe(false);
      expect(result?.error).toMatch(
        /Listing not found or you do not have access to it/,
      );
    });

    it('returns bookings successfully', async () => {
      // Create a listing and booking
      await prisma.listing.create({
        data: {
          id: 1,
          ownerId: mockUserId,
          title: 'Test Listing',
          bookings: {
            create: {
              userId: 'guest_user',
              checkIn: new Date('2023-01-01'),
              checkOut: new Date('2023-01-03'),
              totalPrice: 200,
            },
          },
        },
      });

      const result = await getBookings({
        parsedInput: { listingId: 1 },
        ctx: { userId: mockUserId },
      });

      expect(result?.success).toBe(true);
      expect(result?.bookings).toHaveLength(1);
      expect(result?.bookings?.[0].userId).toBe('guest_user');
    });
  });

  // Add more test cases for other actions...
});
