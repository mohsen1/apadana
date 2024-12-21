import { BookingRequest, BookingRequestStatus, Currency, Prisma } from '@prisma/client';
import { addDays } from 'date-fns';
import _ from 'lodash';

import prisma from '@/lib/prisma';

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

const userIncludeRelations: Prisma.UserInclude = {
  emailAddresses: true,
  externalAccounts: true,
  roles: true,
  permissions: true,
} as const;

export type TestUser = Prisma.UserGetPayload<{
  include: typeof userIncludeRelations;
}>;

export async function findOrCreateTestUser(
  email: string,
  data?: UserCreateData,
): Promise<TestUser> {
  const user = await prisma.user.findFirst({
    where: { emailAddresses: { some: { emailAddress: email } } },
    include: userIncludeRelations,
  });

  if (user) return user;

  // Create new user if not found
  return await prisma.user.create({
    data: {
      ...data,
      emailAddresses: {
        create: {
          emailAddress: email,
          isPrimary: true,
        },
      },
    },
    include: userIncludeRelations,
  });
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
  listingId: string;
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
  // Calculate total price (simplified for testing)
  const listing = await prisma.listing.findUniqueOrThrow({
    where: { id: listingId },
  });

  const daysCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = listing.pricePerNight * daysCount;

  return prisma.bookingRequest.create({
    data: {
      listingId,
      userId,
      checkIn,
      checkOut,
      guests,
      message,
      pets,
      status,
      totalPrice,
    },
  });
}

export async function createTestBooking() {
  throw new Error('Not implemented');
}
