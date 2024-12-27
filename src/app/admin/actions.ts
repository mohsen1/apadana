'use server';

import { Role } from '@prisma/client';
import { z } from 'zod';

import { getUserInServer } from '@/lib/auth';
import prisma from '@/lib/prisma/client';
import { actionClient, UnauthorizedError } from '@/lib/safe-action';
import { PaginationSchema } from '@/lib/schema';

import logger from '@/utils/logger';

export const updateUserRole = actionClient
  .schema(
    z.object({
      userId: z.string(),
      role: z.nativeEnum(Role),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { userId, role } = parsedInput;
    const currentUser = await getUserInServer();

    if (!currentUser?.roles.some((r) => r.role === Role.ADMIN)) {
      throw new UnauthorizedError('Admin role is required to update user roles');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.roles.some((r) => r.role === role)) {
      throw new Error('User already has the role');
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          roles: {
            deleteMany: {},
            create: [{ role }],
          },
        },
      });

      return true;
    } catch (error) {
      logger.error('Failed to update user role', { error, userId, role });
      throw new Error('Failed to update user role');
    }
  });

export const getUsers = actionClient.schema(PaginationSchema).action(async ({ parsedInput }) => {
  const user = await getUserInServer();

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  if (!user.roles.some((role) => role.role === Role.ADMIN)) {
    throw new UnauthorizedError('Admin role is required to view users');
  }

  const { take, skip, search } = parsedInput;

  try {
    // Search for user with query in email, first name, or last name
    const searchQuery = search
      ? {
          OR: [
            {
              emailAddresses: {
                some: {
                  emailAddress: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
            },
            {
              firstName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: searchQuery,
        include: {
          roles: true,
          emailAddresses: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({
        where: searchQuery,
      }),
    ]);

    return {
      users: users.filter(function removePassword(user): user is typeof user & { password: never } {
        user.password = null;
        return true;
      }),
      pagination: {
        total,
        pages: Math.ceil(total / take),
        take,
        skip,
      },
    };
  } catch (error) {
    logger.error('Failed to fetch users', { error });
    throw new Error('Failed to fetch users');
  }
});
