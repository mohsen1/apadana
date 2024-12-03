'use server';

import { sanitizeUserForClient } from '@/lib/auth/utils';
import prisma from '@/lib/prisma/client';
import { actionClient, UnauthorizedError } from '@/lib/safe-action';

import logger from '@/utils/logger';

import { updateUserSchema } from './schema';

export const updateUser = actionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
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

      logger.info('User updated successfully', { userId: ctx.userId });

      return { success: true, user: sanitizeUserForClient(updatedUser) };
    } catch (error) {
      logger.error('Error updating user', { error, userId: ctx.userId });
      throw new Error('Failed to update user');
    }
  });

export const deleteAccount = actionClient.action(async ({ ctx }) => {
  try {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    await prisma.user.delete({
      where: { id: ctx.userId },
    });

    logger.info('Account deleted successfully', { userId: ctx.userId });
    return { success: true };
  } catch (error) {
    logger.error('Error deleting account:', error);
    throw new Error('Failed to delete account');
  }
});
