import { describe, expect, it } from 'vitest';

import prisma from '@/lib/prisma/client';

describe('Database Tests', () => {
  it('should create and retrieve a listing', async () => {
    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
      },
    });

    const listing = await prisma.listing.create({
      data: {
        title: 'Test Listing',
        description: 'Test Description',
        ownerId: user.id,
        propertyType: 'APARTMENT',
        address: '123 Test St',
        pricePerNight: 100,
        houseRules: 'No pets allowed',
      },
    });

    const retrieved = await prisma.listing.findUnique({
      where: { id: listing.id },
    });

    expect(retrieved).toMatchObject({
      title: 'Test Listing',
      description: 'Test Description',
    });
  });
});
