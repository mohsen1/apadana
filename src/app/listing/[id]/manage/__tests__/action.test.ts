import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { type PrismaClient } from '@prisma/client';

import prisma from '@/lib/prisma/client';

import {
  changeBookingRequestStatus,
  editListing,
  editListingImages,
  getBookings,
} from '../action';

// Create a type-safe mock of PrismaClient
type MockPrismaClient = jest.Mocked<PrismaClient>;

// Mock Prisma client with proper types
jest.mock('@/lib/prisma/client', () => ({
  __esModule: true,
  default: {
    listing: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    bookingRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    uploadedPhoto: {
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    listingInventory: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(
      (callback: (tx: MockPrismaClient) => Promise<unknown>) =>
        callback(prisma as unknown as MockPrismaClient),
    ),
  } as unknown as MockPrismaClient,
}));

describe('Listing Management Actions', () => {
  const mockUserId = 'user-123';
  const mockListingId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookings', () => {
    it('should return bookings for a valid listing', async () => {
      const mockListing = { id: mockListingId, ownerId: mockUserId };
      const mockBookings = [
        { id: 1, listingInventory: [], user: {}, bookingRequest: {} },
      ];

      (prisma.listing.findUnique as jest.Mock).mockResolvedValue(mockListing);
      (prisma.booking.findMany as jest.Mock).mockResolvedValue(mockBookings);

      const result = await getBookings.call(
        { userId: mockUserId },
        { listingId: mockListingId },
      );

      expect(result.success).toBe(true);
      expect(result.bookings).toEqual(mockBookings);
    });

    it('should fail when user is not authenticated', async () => {
      const result = await getBookings.call(
        { userId: undefined },
        { listingId: mockListingId },
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('editListing', () => {
    const mockUpdateData = {
      id: mockListingId,
      title: 'Updated Title',
      description: 'Updated Description',
    };

    it('should successfully update a listing', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: mockListingId,
        ownerId: mockUserId,
      });
      (prisma.listing.update as jest.Mock).mockResolvedValue(mockUpdateData);

      const result = await editListing.call(
        { userId: mockUserId },
        mockUpdateData,
      );

      expect(result.success).toBe(true);
      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: mockListingId },
        data: mockUpdateData,
      });
    });
  });

  describe('editListingImages', () => {
    const mockImages = [
      { key: 'image1', url: 'url1', name: 'name1' },
      { key: 'image2', url: 'url2', name: 'name2' },
    ];

    it('should successfully update listing images', async () => {
      (prisma.listing.findUnique as jest.Mock).mockResolvedValue({
        id: mockListingId,
        ownerId: mockUserId,
        images: [{ id: 1, key: 'oldImage', url: 'oldUrl', name: 'oldName' }],
      });

      const result = await editListingImages.call(
        { userId: mockUserId },
        { listingId: mockListingId, images: mockImages },
      );

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('changeBookingRequestStatus', () => {
    const mockBookingRequestId = '123';
    const mockListing = {
      id: mockListingId,
      ownerId: mockUserId,
      pricePerNight: 100,
    };

    it('should successfully accept a booking request', async () => {
      (prisma.bookingRequest.findUnique as jest.Mock).mockResolvedValue({
        id: mockBookingRequestId,
        listing: mockListing,
        userId: 'guest-123',
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-03'),
        status: 'PENDING',
      });

      const result = await changeBookingRequestStatus.call(
        { userId: mockUserId },
        {
          bookingRequestId: mockBookingRequestId,
          status: 'ACCEPTED',
        },
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('ACCEPTED');
      expect(prisma.bookingRequest.update).toHaveBeenCalled();
      expect(prisma.booking.create).toHaveBeenCalled();
    });
  });
});
