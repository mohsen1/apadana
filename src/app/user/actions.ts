'use server';

import { z } from 'zod';

import { sanitizeUserForClient } from '@/lib/auth/utils';
import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError, UnauthorizedError } from '@/lib/safe-action';
import { ClientUserSchema, UpdateUserSchema } from '@/lib/schema';

import logger from '@/utils/logger';

export const updateUser = actionClient
  .schema(UpdateUserSchema)
  .outputSchema(z.object({ user: ClientUserSchema }))
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: ctx.userId,
      },
      include: {
        emailAddresses: true,
        roles: true,
        permissions: true,
      },
      data: {
        ...parsedInput,
        updatedAt: new Date(),
      },
    });

    const user = sanitizeUserForClient(updatedUser);

    if (!user) {
      throw new ClientVisibleError('Failed to update user');
    }

    logger.info('User updated successfully', { userId: ctx.userId });

    return { user };
  });

export const deleteAccount = actionClient
  .outputSchema(z.object({ user: z.literal(null) }))
  .action(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    await prisma.user.delete({
      where: { id: ctx.userId },
    });

    logger.info('Account deleted successfully', { userId: ctx.userId });

    return { user: null };
  });
