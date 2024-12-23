'use server';

import { z } from 'zod';

import { deleteServerSession, getUserInServer } from '@/lib/auth';
import { argon } from '@/lib/auth/argon';
import { RESET_TOKEN_DURATION, SESSION_DURATION } from '@/lib/auth/constants';
import { sanitizeUserForClient } from '@/lib/auth/utils';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError } from '@/lib/safe-action';
import { clientUserSchema, loginSchema, successfulLogin } from '@/lib/schema';

import logger from '@/utils/logger';

export const login = actionClient
  .schema(loginSchema)
  .outputSchema(successfulLogin)
  .action(async ({ parsedInput, ctx }) => {
    const user = await prisma.user.findFirst({
      where: {
        emailAddresses: {
          some: {
            emailAddress: parsedInput.email,
          },
        },
      },
      include: {
        emailAddresses: true,
        roles: true,
        permissions: true,
      },
    });

    if (!user) {
      // This should never happen, but if it does, we don't want to leak information
      throw new ClientVisibleError('Invalid email or password');
    }

    // Check if user exists and has password
    if (!user.password) {
      throw new ClientVisibleError('Invalid email or password');
    }

    // Verify password
    const validPassword = await argon.verify(user.password, parsedInput.password);
    if (!validPassword) {
      throw new ClientVisibleError('Invalid email or password');
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
      },
    });

    // Get primary email
    const primaryEmail = user.emailAddresses.find((e) => e.isPrimary)?.emailAddress;

    if (!primaryEmail) {
      throw new Error('Primary email not found');
    }

    ctx.setSession(session);

    const clientUser = sanitizeUserForClient(user);

    if (!clientUser) {
      throw new Error('User not found');
    }

    return {
      user: clientUser,
    };
  });

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  password:
    process.env.NODE_ENV === 'development'
      ? z.string().min(1, 'Password is required')
      : z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .max(100, 'Password must be less than 100 characters'),
});

const successfulSignUp = z.object({
  user: clientUserSchema,
});

export const signUp = actionClient
  .schema(signUpSchema)
  .outputSchema(successfulSignUp)
  .action(async ({ parsedInput, ctx }) => {
    // ensure email is not already in use
    const existingUser = await prisma.user.findFirst({
      where: {
        emailAddresses: { some: { emailAddress: parsedInput.email } },
      },
    });
    if (existingUser) {
      throw new Error('There is already an account with this email. Please login with that email.');
    }

    const hashedPassword = await argon.hash(parsedInput.password);
    const user = await prisma.user.create({
      include: {
        emailAddresses: true,
        sessions: true,
        roles: true,
        permissions: true,
      },
      data: {
        password: hashedPassword,
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        emailAddresses: {
          create: [
            {
              emailAddress: parsedInput.email,
              isPrimary: true,
            },
          ],
        },
        sessions: {
          create: {
            expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
          },
        },
      },
    });

    ctx.setSession(user.sessions[0]);

    // Send welcome email
    await sendWelcomeEmail(parsedInput.email, parsedInput.firstName);

    const clientUser = sanitizeUserForClient(user);
    if (!clientUser) {
      throw new Error('Failed to create user');
    }

    return {
      user: clientUser,
    };
  });

export type ClientUser = z.infer<typeof clientUserSchema>;

const getCurrentUserOutput = z
  .object({
    user: clientUserSchema.nullable(),
  })
  .nullable();

export const getCurrentUser = actionClient.outputSchema(getCurrentUserOutput).action(async () => {
  const user = await getUserInServer();
  const clientUser = sanitizeUserForClient(user);
  return { user: clientUser };
});

export const logOut = actionClient
  .outputSchema(z.object({ user: z.literal(null) }))
  .action(async () => {
    await deleteServerSession();
    return { user: null };
  });

const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
});

export const requestPasswordReset = actionClient
  .schema(requestPasswordResetSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Find user by email
      const user = await prisma.user.findFirst({
        where: {
          emailAddresses: {
            some: {
              emailAddress: parsedInput.email,
            },
          },
        },
        include: {
          emailAddresses: true,
        },
      });

      // If no user found, still return success to prevent email enumeration
      if (!user) {
        logger.info('Password reset requested for non-existent email', {
          email: parsedInput.email,
        });
        return;
      }

      // Delete any existing reset tokens for this user
      await prisma.passwordReset.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token
      const resetToken = await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + RESET_TOKEN_DURATION.milliseconds()),
        },
      });

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken.token}`;

      // Send reset email
      await sendPasswordResetEmail(parsedInput.email, resetLink);

      logger.info('Password reset email sent', {
        userId: user.id,
        email: parsedInput.email,
      });
    } catch (error) {
      logger.error('Error in requestPasswordReset:', error);
      throw new ClientVisibleError(
        'Unable to process password reset request. Please try again later.',
      );
    }
  });

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Find valid reset token
      const resetToken = await prisma.passwordReset.findUnique({
        where: { token: parsedInput.token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new ClientVisibleError('Invalid or expired reset token');
      }

      if (resetToken.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.passwordReset.delete({
          where: { id: resetToken.id },
        });
        throw new ClientVisibleError('Reset token has expired');
      }

      // Hash new password
      const hashedPassword = await argon.hash(parsedInput.password);

      // Update user password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      // Delete used reset token
      await prisma.passwordReset.delete({
        where: { id: resetToken.id },
      });

      // Delete all existing sessions for this user for security
      await prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      });

      logger.info('Password reset successful', {
        userId: resetToken.userId,
      });
    } catch (error) {
      logger.error('Error in resetPassword:', error);
      if (error instanceof ClientVisibleError) {
        throw error;
      }
      throw new ClientVisibleError('Unable to reset password. Please try again later.');
    }
  });
