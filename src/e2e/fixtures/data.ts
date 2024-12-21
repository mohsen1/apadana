import { Prisma } from '@prisma/client';
import _ from 'lodash';

/**
 * This user exists in the production environment and is used for e2e testing.
 */
export const prodE2eTestHostUser = {
  firstName: 'E2E Test',
  lastName: 'User',
  email: 'test-user@e2e-testing.apadana.app',
  password: 'nslr83ub9v8',
};

export const prodE2eTestGuestUser = {
  firstName: 'E2E Test',
  lastName: 'Guest',
  email: 'test-guest@e2e-testing.apadana.app',
  password: 'nslr83ub9v8',
};

export const seedUser = {
  firstName: 'E2E Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
};

// listing fixtures
export const prodE2eTestListing_usa_1: Omit<Prisma.ListingCreateInput, 'owner'> = {
  title: 'My new test listing',
  description: 'This is a test listing',
  pricePerNight: 100,
  currency: 'USD',
  latitude: 37.7749,
  longitude: -122.4194,
  address: '123 Main St, San Francisco, CA 94101',
  propertyType: 'apartment',
  houseRules: 'No pets allowed',
};
