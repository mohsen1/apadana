import { Currency } from '@prisma/client';

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

export async function createListing({ hostId }: { hostId: string }) {
  return prisma.listing.create({
    data: {
      title: 'Test Listing',
      description: 'Cozy spot',
      propertyType: 'apartment',
      address: '123 Test Ave',
      pricePerNight: 100,
      currency: Currency.USD,
      houseRules: 'No smoking',
      ownerId: hostId,
    },
  });
}
