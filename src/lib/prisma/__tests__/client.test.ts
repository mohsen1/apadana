import { Prisma } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import prisma, { getUserPassword } from '../client';

describe('Prisma Client', () => {
  const testUser: Prisma.UserCreateInput = {
    id: 'test-user-id',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: {
      create: {
        emailAddress: 'test@apadana.app',
        isPrimary: true,
      },
    },
  };

  beforeEach(async () => {
    await prisma.user.create({ data: testUser });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('password middleware', () => {
    it('should strip password from regular user queries', async () => {
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(user).toBeTruthy();
      expect(user?.password).toBeUndefined();
    });

    it('should strip passwords from array results', async () => {
      const users = await prisma.user.findMany();

      expect(users).toHaveLength(1);
      expect(users[0].password).toBeUndefined();
    });
  });

  describe('getUserPassword', () => {
    it('should return password for existing user', async () => {
      const password = await getUserPassword(testUser?.id);

      expect(password).toBe(testUser.password);
    });

    it('should return null for non-existent user', async () => {
      const password = await getUserPassword('non-existent-id');

      expect(password).toBeNull();
    });
  });
});
