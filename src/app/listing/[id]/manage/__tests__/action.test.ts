import { format, parse } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import prisma from '@/lib/prisma/client';

import {
  changeBookingRequestStatus,
  editInventory,
  editListing,
  editListingImages,
  getBookings,
  getListings,
} from '../action';

vi.mock('date-fns', () => ({
  format: vi.fn(),
  parse: vi.fn(),
}));

vi.mock('date-fns-tz', () => ({
  toZonedTime: vi.fn(),
}));

vi.mock('@/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    listing: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    listingInventory: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    uploadedPhoto: {
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    bookingRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/safe-action', () => ({
  actionClient: {
    schema: (schema) => ({
      action: (fn) => fn,
    }),
  },
}));

vi.mock('@/utils', () => ({
  assertError: vi.fn((err) => err),
}));

describe('Actions Tests', () => {
  const mockUserId = 'user_123';

  beforeEach(() => {
    vi.clearAllMocks();
    format.mockImplementation(() => '2023-01-01');
    parse.mockImplementation(() => new Date('2023-01-01T14:00:00Z'));
    toZonedTime.mockImplementation(() => new Date('2023-01-01T14:00:00Z'));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getBookings', () => {
    it('fails if no userId in context', async () => {
      const result = await getBookings({
        parsedInput: { listingId: 1 },
        ctx: {},
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/User not found/);
    });

    it('fails if listing not owned by user', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);
      const result = await getBookings({
        parsedInput: { listingId: 1 },
        ctx: { userId: mockUserId },
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(
        /Listing not found or you do not have access to it/,
      );
    });

    it('returns bookings successfully', async () => {
      prisma.listing.findUnique.mockResolvedValue({
        id: 1,
        ownerId: mockUserId,
      });
      prisma.booking.findMany.mockResolvedValue([{ id: 10, userId: 'abc' }]);

      const result = await getBookings({
        parsedInput: { listingId: 1 },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(true);
      expect(result.bookings).toEqual([{ id: 10, userId: 'abc' }]);
    });
  });

  describe('editListing', () => {
    it('fails if no userId', async () => {
      const result = await editListing({
        parsedInput: { id: 1 },
        ctx: {},
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/User not found/);
    });

    it('fails if listing not found', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);
      const result = await editListing({
        parsedInput: { id: 1 },
        ctx: { userId: mockUserId },
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Listing not found/);
    });

    it('updates listing successfully', async () => {
      prisma.listing.findUnique.mockResolvedValue({
        id: 1,
        ownerId: mockUserId,
      });
      prisma.listing.update.mockResolvedValue({ id: 1, title: 'Updated' });
      const result = await editListing({
        parsedInput: { id: 1, title: 'New Title' },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(true);
      expect(prisma.listing.update).toHaveBeenCalled();
    });
  });

  describe('editListingImages', () => {
    it('fails if no userId', async () => {
      const result = await editListingImages({
        parsedInput: { listingId: 1, images: [] },
        ctx: {},
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/User not authenticated/);
    });

    it('fails if listing not found', async () => {
      prisma.listing.findUnique.mockResolvedValue(null);
      const result = await editListingImages({
        parsedInput: { listingId: 1, images: [] },
        ctx: { userId: mockUserId },
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Listing not found/);
    });

    it('edits listing images successfully', async () => {
      prisma.listing.findUnique.mockResolvedValue({
        id: 1,
        ownerId: mockUserId,
        images: [{ id: 'old_img', key: 'old_key' }],
      });

      prisma.$transaction.mockImplementation(async (fn) => {
        return fn({
          uploadedPhoto: {
            delete: prisma.uploadedPhoto.delete,
            upsert: prisma.uploadedPhoto.upsert,
          },
        });
      });

      prisma.uploadedPhoto.delete.mockResolvedValue({});
      prisma.uploadedPhoto.upsert.mockResolvedValue({});

      const result = await editListingImages({
        parsedInput: {
          listingId: 1,
          images: [{ url: 'new_url', key: 'new_key', name: 'new_name' }],
        },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(true);
      expect(prisma.uploadedPhoto.delete).toHaveBeenCalledWith({
        where: { id: 'old_img' },
      });
      expect(prisma.uploadedPhoto.upsert).toHaveBeenCalled();
    });
  });

  describe('editInventory', () => {
    it('edits inventory successfully, converts times properly', async () => {
      prisma.listing.findUnique.mockResolvedValue({
        id: 1,
        ownerId: mockUserId,
        checkInTime: '14:00',
        timeZone: 'America/New_York',
      });
      prisma.listingInventory.deleteMany.mockResolvedValue({});
      prisma.listingInventory.createMany.mockResolvedValue({});
      prisma.listingInventory.count.mockResolvedValue(1);

      prisma.$transaction.mockImplementation(async (fn) => {
        return fn({
          listingInventory: {
            deleteMany: prisma.listingInventory.deleteMany,
            createMany: prisma.listingInventory.createMany,
            count: prisma.listingInventory.count,
          },
        });
      });

      const inventoryItem = {
        date: new Date('2023-01-02T00:00:00Z'),
        price: 200,
      };

      const result = await editInventory({
        parsedInput: {
          listingId: 1,
          inventory: [inventoryItem],
        },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(true);
      expect(prisma.listingInventory.createMany).toHaveBeenCalledTimes(1);
    });

    it('fails if inventory count mismatch after update', async () => {
      prisma.listing.findUnique.mockResolvedValue({
        id: 1,
        ownerId: mockUserId,
        checkInTime: '14:00',
        timeZone: 'America/New_York',
      });
      prisma.listingInventory.deleteMany.mockResolvedValue({});
      prisma.listingInventory.createMany.mockResolvedValue({});
      prisma.listingInventory.count.mockResolvedValue(0);

      prisma.$transaction.mockImplementation(async (fn) => {
        return fn({
          listingInventory: {
            deleteMany: prisma.listingInventory.deleteMany,
            createMany: prisma.listingInventory.createMany,
            count: prisma.listingInventory.count,
          },
        });
      });

      const inventoryItem = {
        date: new Date('2023-01-02T00:00:00Z'),
        price: 200,
      };

      const result = await editInventory({
        parsedInput: {
          listingId: 1,
          inventory: [inventoryItem],
        },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Failed to update inventory/);
    });
  });

  describe('getListings', () => {
    it('returns listings', async () => {
      prisma.listing.findMany.mockResolvedValue([{ id: 1 }]);
      prisma.listing.count.mockResolvedValue(1);
      const result = await getListings({
        parsedInput: { take: 10, skip: 0 },
        ctx: { userId: mockUserId },
      });
      expect(result.success).toBe(true);
      expect(result.listings).toEqual([{ id: 1 }]);
      expect(result.totalCount).toBe(1);
    });

    it('handles error', async () => {
      prisma.listing.findMany.mockRejectedValue(new Error('DB error'));
      const result = await getListings({
        parsedInput: { take: 10, skip: 0 },
        ctx: { userId: mockUserId },
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/DB error/);
    });
  });

  describe('changeBookingRequestStatus', () => {
    it('fails if no userId', async () => {
      const result = await changeBookingRequestStatus({
        parsedInput: { bookingRequestId: '1', status: 'ACCEPTED' },
        ctx: {},
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/User not found/);
    });

    it('fails if booking request not found or not owner', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue(null);
      const result = await changeBookingRequestStatus({
        parsedInput: { bookingRequestId: '1', status: 'ACCEPTED' },
        ctx: { userId: mockUserId },
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Booking request not found/);
    });

    it('accepts a booking request and updates inventory', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue({
        id: 10,
        listingId: 1,
        status: 'PENDING',
        userId: 'other_user',
        checkIn: new Date('2023-01-01'),
        checkOut: new Date('2023-01-03'),
        listing: {
          ownerId: mockUserId,
          pricePerNight: 100,
        },
      });

      prisma.$transaction.mockImplementation(async (fn) => {
        return fn({
          bookingRequest: {
            update: prisma.bookingRequest.update,
          },
          booking: {
            create: prisma.booking.create,
            findFirst: prisma.booking.findFirst,
            update: prisma.booking.update,
            delete: prisma.booking.delete,
          },
          listingInventory: {
            findUnique: prisma.listingInventory.findUnique,
            update: prisma.listingInventory.update,
            create: prisma.listingInventory.create,
          },
        });
      });

      prisma.bookingRequest.update.mockResolvedValue({});
      prisma.booking.create.mockResolvedValue({ id: 20 });
      prisma.listingInventory.findUnique.mockResolvedValue(null);
      prisma.listingInventory.create.mockResolvedValue({ price: 100 });
      prisma.listingInventory.update.mockResolvedValue({});
      prisma.booking.update.mockResolvedValue({});

      const result = await changeBookingRequestStatus({
        parsedInput: { bookingRequestId: '10', status: 'ACCEPTED' },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('ACCEPTED');
      expect(prisma.booking.create).toHaveBeenCalled();
      expect(prisma.listingInventory.create).toHaveBeenCalledTimes(2); // 2 nights: 1st and 2nd
      expect(prisma.booking.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: { totalPrice: 200 },
      });
    });

    it('rejects an accepted booking request and restores inventory', async () => {
      prisma.bookingRequest.findUnique.mockResolvedValue({
        id: 10,
        listingId: 1,
        status: 'ACCEPTED',
        userId: 'other_user',
        checkIn: new Date('2023-01-01'),
        checkOut: new Date('2023-01-03'),
        listing: {
          ownerId: mockUserId,
          pricePerNight: 100,
        },
      });

      prisma.$transaction.mockImplementation(async (fn) => {
        return fn({
          bookingRequest: {
            update: prisma.bookingRequest.update,
          },
          booking: {
            findFirst: prisma.booking.findFirst,
            delete: prisma.booking.delete,
          },
          listingInventory: {
            update: prisma.listingInventory.update,
          },
        });
      });

      prisma.bookingRequest.update.mockResolvedValue({});
      prisma.booking.findFirst.mockResolvedValue({
        id: 20,
        listingInventory: [{ id: 99, isAvailable: false }],
      });
      prisma.listingInventory.update.mockResolvedValue({});
      prisma.booking.delete.mockResolvedValue({});

      const result = await changeBookingRequestStatus({
        parsedInput: { bookingRequestId: '10', status: 'REJECTED' },
        ctx: { userId: mockUserId },
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('REJECTED');
      expect(prisma.listingInventory.update).toHaveBeenCalledWith({
        where: { id: 99 },
        data: {
          isAvailable: true,
          bookingId: null,
        },
      });
      expect(prisma.booking.delete).toHaveBeenCalled();
    });
  });
});
