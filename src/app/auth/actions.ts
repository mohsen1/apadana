'use server';

import { Role } from '@prisma/client';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { deleteServerSession, getUserInServer } from '@/lib/auth';
import { argon } from '@/lib/auth/argon';
import { RESET_TOKEN_DURATION, SESSION_COOKIE_NAME, SESSION_DURATION } from '@/lib/auth/constants';
import { loginRateLimiter, signupRateLimiter } from '@/lib/auth/rate-limiter';
import { sanitizeUserForClient } from '@/lib/auth/utils';
import { sendPasswordResetEmail, sendWelcomeEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError, RateLimitedError } from '@/lib/safe-action';
import { ClientUserSchema, LoginSchema, SignUpSchema, SuccessfulLoginSchema } from '@/lib/schema';

import logger from '@/utils/logger';
import { createPasswordResetUrl, createVerificationUrl } from '@/utils/url';

export const login = actionClient
  .schema(LoginSchema)
  .outputSchema(SuccessfulLoginSchema)
  .action(async ({ parsedInput }) => {
    // Check rate limit
    const { blocked, remainingAttempts, msBeforeNextAttempt } = await loginRateLimiter.check(
      parsedInput.email,
    );
    if (blocked) {
      const minutesLeft = Math.ceil(msBeforeNextAttempt / (60 * 1000));
      throw new ClientVisibleError(
        `Too many login attempts. Please try again in ${minutesLeft} minutes.`,
      );
    }

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

    // Increment attempt counter before checking credentials
    await loginRateLimiter.increment(parsedInput.email);

    if (!user) {
      throw new RateLimitedError(
        remainingAttempts > 0
          ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
          : 'Invalid email or password.',
      );
    }

    // Check if user exists and has password
    if (!user.password) {
      throw new RateLimitedError(
        remainingAttempts > 0
          ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
          : 'Invalid email or password.',
      );
    }

    // Verify password
    const validPassword = await argon.verify(user.password, parsedInput.password);
    if (!validPassword) {
      throw new RateLimitedError(
        remainingAttempts > 0
          ? `Invalid email or password. ${remainingAttempts} attempts remaining.`
          : 'Invalid email or password.',
      );
    }

    // Reset rate limiter on successful login
    await loginRateLimiter.reset(parsedInput.email);

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
  .schema(SignUpSchema)
  .outputSchema(
    z.object({
      user: ClientUserSchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    // Check rate limit
    const { blocked, remainingAttempts, msBeforeNextAttempt } = await signupRateLimiter.check(
      parsedInput.email,
    );
    if (blocked) {
      const minutesLeft = Math.ceil(msBeforeNextAttempt / (60 * 1000));
      throw new RateLimitedError(
        `Too many signup attempts. Please try again in ${minutesLeft} minutes.`,
      );
    }

    // Increment attempt counter before checking
    await signupRateLimiter.increment(parsedInput.email);

    // ensure email is not already in use
    const existingUser = await prisma.user.findFirst({
      where: {
        emailAddresses: { some: { emailAddress: parsedInput.email } },
      },
    });
    if (existingUser) {
      throw new RateLimitedError(
        remainingAttempts > 0
          ? `There is already an account with this email. Please login with that email. ${remainingAttempts} attempts remaining.`
          : 'There is already an account with this email. Please login with that email.',
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

    // Reset rate limiter on successful signup
    await signupRateLimiter.reset(parsedInput.email);

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
