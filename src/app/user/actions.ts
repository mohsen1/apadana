'use server';

import { z } from 'zod';

import { sanitizeUserForClient } from '@/lib/auth/utils';
import { sendEmailVerificationEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError, UnauthorizedError } from '@/lib/safe-action';
import { ClientUserSchema, UpdateUserSchema } from '@/lib/schema';

import { assertError } from '@/utils';
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

const addEmailSchema = z.object({
  emailAddress: z.string().email('Please enter a valid email address'),
});

export const addEmailAddress = actionClient
  .schema(addEmailSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    // Check if email already exists but don't reveal if it does
    const existingEmail = await prisma.emailAddress.findUnique({
      where: { emailAddress: parsedInput.emailAddress },
    });

    if (existingEmail) {
      // Return success even if email exists to prevent email enumeration
      return { success: true };
    }

    const verificationCode = crypto.randomUUID();

    // Add new email address with verification code
    await prisma.emailAddress.create({
      data: {
        emailAddress: parsedInput.emailAddress,
        userId: ctx.userId,
        isPrimary: false,
        verification: verificationCode,
        verified: false,
      },
    });

    try {
      await sendEmailVerificationEmail({
        to: parsedInput.emailAddress,
        verificationCode,
      });
    } catch (error) {
      assertError(error);
      logger.error('Failed to send verification email', { error });
      throw new ClientVisibleError('Failed to send verification email');
    }

    return { success: true };
  });

const setPrimaryEmailSchema = z.object({
  emailAddressId: z.string(),
});

export const setPrimaryEmail = actionClient
  .schema(setPrimaryEmailSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    // Check if email is verified
    const emailToMakePrimary = await prisma.emailAddress.findFirst({
      where: {
        id: parsedInput.emailAddressId,
        userId: ctx.userId,
        verification: null, // Only verified emails can be made primary
      },
    });

    if (!emailToMakePrimary) {
      throw new ClientVisibleError('Email must be verified before it can be made primary');
    }

    // Start a transaction to update primary status
    await prisma.$transaction(async (tx) => {
      // First, set all user's email addresses to non-primary
      await tx.emailAddress.updateMany({
        where: { userId: ctx.userId! },
        data: { isPrimary: false },
      });

      // Then set the selected email as primary
      await tx.emailAddress.update({
        where: { id: parsedInput.emailAddressId },
        data: { isPrimary: true },
      });
    });

    return { success: true, emailAddressId: parsedInput.emailAddressId };
  });

const deleteEmailSchema = z.object({
  emailAddressId: z.string(),
});

export const deleteEmailAddress = actionClient
  .schema(deleteEmailSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    // Check if email exists and is not primary
    const emailToDelete = await prisma.emailAddress.findFirst({
      where: {
        id: parsedInput.emailAddressId,
        userId: ctx.userId,
        isPrimary: false,
      },
    });

    if (!emailToDelete) {
      throw new ClientVisibleError('Cannot delete primary email address');
    }

    await prisma.emailAddress.delete({
      where: { id: parsedInput.emailAddressId },
    });

    return { success: true };
  });

export const resendEmailVerification = actionClient
  .schema(addEmailSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.userId) {
      throw new UnauthorizedError();
    }

    const verificationCode = crypto.randomUUID();

    // Update existing email with new verification code
    await prisma.emailAddress.update({
      where: {
        emailAddress: parsedInput.emailAddress,
        userId: ctx.userId,
      },
      data: {
        verification: verificationCode,
      },
    });

    try {
      await sendEmailVerificationEmail({
        to: parsedInput.emailAddress,
        verificationCode,
      });
    } catch (error) {
      assertError(error);
      logger.error('Failed to send verification email', { error });
      throw new ClientVisibleError('Failed to send verification email');
    }

    return { success: true };
  });
