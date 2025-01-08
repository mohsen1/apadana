'use server';

import { Role } from '@prisma/client';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { deleteServerSession, getUserInServer } from '@/lib/auth';
import { argon } from '@/lib/auth/argon';
import { RESET_TOKEN_DURATION, SESSION_COOKIE_NAME, SESSION_DURATION } from '@/lib/auth/constants';
import { sanitizeUserForClient } from '@/lib/auth/utils';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import {
  actionClient,
  ClientVisibleError,
  createRateLimiter,
  RATE_LIMIT_BASED_ON_IP,
  RATE_LIMIT_BASED_ON_USER_ID,
} from '@/lib/safe-action';
import {
  ClientUserSchema,
  LoginSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
  SignUpSchema,
  SuccessfulLoginSchema,
} from '@/lib/schema';

import logger from '@/utils/logger';
import { createPasswordResetUrl, createVerificationUrl } from '@/utils/url';

export const login = actionClient
  .use(createRateLimiter({ basedOn: [RATE_LIMIT_BASED_ON_USER_ID, RATE_LIMIT_BASED_ON_IP] }))
  .schema(LoginSchema)
  .outputSchema(SuccessfulLoginSchema)
  .action(async ({ parsedInput }) => {
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

    // Check if user exists
    if (!user) {
      throw new ClientVisibleError('Invalid email or password');
    }

    // Check if user exists and has password
    if (!user.password) {
      throw new ClientVisibleError('User does not have a password');
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

    const { set: setCookie } = await cookies();

    setCookie(SESSION_COOKIE_NAME, session.id, {
      path: '/',
      expires: session.expiresAt,
      httpOnly: true,
      secure: true,
    });

    const clientUser = sanitizeUserForClient(user);
    if (!clientUser) {
      throw new Error('Failed to create user');
    }

    return {
      user: clientUser,
    };
  });

export const signUp = actionClient
  .use(createRateLimiter({ basedOn: [RATE_LIMIT_BASED_ON_IP] }))
  .schema(SignUpSchema)
  .outputSchema(
    z.object({
      user: ClientUserSchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    // ensure email is not already in use
    const existingUser = await prisma.user.findFirst({
      where: {
        emailAddresses: { some: { emailAddress: parsedInput.email } },
      },
    });
    if (existingUser) {
      throw new ClientVisibleError(
        'There is already an account with this email. Please login with that email.',
      );
    }

    const hashedPassword = await argon.hash(parsedInput.password);
    const verificationCode = crypto.randomUUID();
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
              verified: parsedInput.email === process.env.ADMIN_EMAIL,
              verification: verificationCode,
            },
          ],
        },
        roles: {
          create: [
            { role: parsedInput.email === process.env.ADMIN_EMAIL ? Role.ADMIN : Role.HOST },
          ],
        },
        sessions: {
          create: {
            expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
          },
        },
      },
    });

    const session = user.sessions[0];

    const { set: setCookie } = await cookies();

    setCookie(SESSION_COOKIE_NAME, session.id, {
      path: '/',
      expires: session.expiresAt,
      httpOnly: true,
      secure: true,
    });

    const verificationUrl = createVerificationUrl(verificationCode, parsedInput.email);

    // Send welcome email
    await sendWelcomeEmail(parsedInput.email, parsedInput.firstName, verificationUrl);

    const clientUser = sanitizeUserForClient(user);
    if (!clientUser) {
      throw new Error('Failed to create user');
    }

    return {
      user: clientUser,
    };
  });

export type ClientUser = z.infer<typeof ClientUserSchema>;

const getCurrentUserOutput = z
  .object({
    user: ClientUserSchema.nullable(),
  })
  .nullable();

export const getCurrentUser = actionClient.outputSchema(getCurrentUserOutput).action(async () => {
  const user = await getUserInServer();
  if (!user) return { user: null };

  const clientUser = sanitizeUserForClient(user);
  if (!clientUser) return { user: null };

  return { user: clientUser };
});

export const logOut = actionClient
  .outputSchema(z.object({ user: z.literal(null) }))
  .action(async () => {
    await deleteServerSession();
    return { user: null };
  });

export const requestPasswordReset = actionClient
  .use(createRateLimiter({ basedOn: [RATE_LIMIT_BASED_ON_IP] }))
  .schema(RequestPasswordResetSchema)
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
      const resetLink = createPasswordResetUrl(resetToken.token, parsedInput.email);

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
  .use(createRateLimiter({ basedOn: [RATE_LIMIT_BASED_ON_USER_ID], maxAttempts: 5 }))
  .schema(ResetPasswordSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Find valid reset token and ensure it hasn't been used
      const resetToken = await prisma.passwordReset.findFirst({
        where: {
          token: parsedInput.token,
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: { user: true },
      });

      if (!resetToken) {
        throw new ClientVisibleError(
          'This password reset link is invalid or has expired. Please request a new one.',
        );
      }

      // Hash new password
      const hashedPassword = await argon.hash(parsedInput.password);

      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Update user password
        await tx.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword },
        });

        // Mark token as used
        await tx.passwordReset.update({
          where: { id: resetToken.id },
          data: { used: true },
        });

        // Delete all existing sessions
        await tx.session.deleteMany({
          where: { userId: resetToken.userId },
        });
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
