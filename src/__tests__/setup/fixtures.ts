import {
  BookingRequest,
  BookingRequestStatus,
  Currency,
  Prisma,
} from '@prisma/client';
import { addDays } from 'date-fns';
import _ from 'lodash';

import { setSafeActionContext } from '@/lib/__mocks__/safe-action';
import prisma from '@/lib/prisma';

import { createBookingRequest } from '@/app/listing/[id]/booking/action';

type UserCreateData = Partial<{
  firstName: string;
  lastName: string;
  emailAddresses: {
    create: {
      emailAddress: string;
      isPrimary: boolean;
    }[];
  };
}>;

export async function findOrCreateTestUser(
  emailAddress: string,
  dataArg: UserCreateData = {},
) {
  const data = {
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: {
      create: [{ emailAddress, isPrimary: true }],
    },
    ...dataArg,
  };

  const existing = await prisma.user.findFirst({
    include: { emailAddresses: true },
    where: {
      emailAddresses: {
        some: {
          emailAddress,
        },
      },
    },
  });

  if (!existing) {
    return prisma.user.create({
      data,
      include: { emailAddresses: true },
    });
  }

  return existing;
}

export async function createTestListing(
  createListingData: Partial<Prisma.ListingCreateInput> & {
    ownerId: string;
  },
) {
  const defaultData = {
    title: 'Test Listing',
    description: 'Cozy spot',
    propertyType: 'apartment',
    address: '123 Test Ave',
    pricePerNight: 100,
    currency: Currency.USD,
    houseRules: 'No smoking',
  };
  return prisma.listing.create({
    data: {
      ...defaultData,
      published: true,
      ..._.omit(createListingData, 'ownerId'),
      owner: {
        connect: {
          id: createListingData.ownerId,
        },
      },
    },
  });
}

interface CreateTestBookingRequestOptions {
  userId: string;
  listingId: number;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  message?: string;
  pets?: boolean;
  status?: BookingRequestStatus;
}

export async function createTestBookingRequest({
  userId,
  listingId,
  checkIn = addDays(new Date(), 7),
  checkOut = addDays(new Date(), 10),
  guests = 2,
  message = 'Test booking request',
  pets = false,
  status = BookingRequestStatus.PENDING,
}: CreateTestBookingRequestOptions): Promise<BookingRequest> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  setSafeActionContext({ user });

  const result = await createBookingRequest({
    listingId,
    checkIn,
    checkOut,
    guests,
    message,
    pets,
  });

  if (!result?.data) {
    throw new Error('Failed to create test booking request');
  }

  // If a different status is requested, update it
  if (status !== BookingRequestStatus.PENDING) {
    return prisma.bookingRequest.update({
      where: { id: result.data.id },
      data: { status },
    });
  }

  return result.data;
}
