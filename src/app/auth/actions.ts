'use server';

import { cookies } from 'next/headers';
import { createId } from 'oslo/id';
import { z } from 'zod';

import { argon, SESSION_DURATION } from '@/lib/auth/oslo';
import { sendWelcomeEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

import logger from '@/utils/logger';

const failure = z.object({
  success: z.literal(false),
  error: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const successfulLogin = z.object({
  success: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
});

function createSession(userId: string) {
  return prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
    },
  });
}

export const login = actionClient
  .schema(loginSchema)
  .outputSchema(successfulLogin.or(failure))
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

      if (!user || !user.password) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Verify password
      const validPassword = await argon.verify(
        user.password,
        parsedInput.password,
      );
      if (!validPassword) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Create new session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
        },
      });

      // Set session cookie
      cookies().set('sessionId', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: session.expiresAt,
        path: '/',
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.emailAddresses.find((e) => e.isPrimary)?.emailAddress,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: 'Something went wrong',
      };
    }
  });

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const successfulSignUp = z.object({
  success: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
});

export const signUp = actionClient
  .schema(signUpSchema)
  .outputSchema(successfulSignUp.or(failure))
  .action(async ({ parsedInput }) => {
    const hashedPassword = await argon.hash(parsedInput.password);
    const userId = createId();

    const user = await prisma.user.create({
      data: {
        id: userId,
        emailAddresses: {
          create: {
            id: createId(),
            emailAddress: email,
            isPrimary: true,
          },
        },
        password: hashedPassword,
      },
    });

    // Create session
    const session = await createSession(user.id);

    // Send welcome email
    await sendWelcomeEmail(user.email);

    return { user, session };
  });

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

const getCurrentUserOutput = z.object({
  success: z.literal(true),
  user: userSchema.nullable(),
});

export const getCurrentUser = actionClient
  .outputSchema(getCurrentUserOutput.or(failure))
  .action(async () => {
    try {
      const { get: getCookie, delete: deleteCookie } = await cookies();
      const sessionId = getCookie('sessionId');

      if (!sessionId) {
        return { success: true, user: null };
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            include: {
              emailAddresses: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      });

      if (!session || session.expiresAt < new Date()) {
        deleteCookie('sessionId');
        return { success: true, user: null };
      }

      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.emailAddresses[0]?.emailAddress,
        },
      };
    } catch (error) {
      logger.error('Error getting current user:', error);
      return { success: true, user: null };
    }
  });

export const logOut = actionClient
  .outputSchema(z.object({ success: z.literal(true) }).or(failure))
  .action(async () => {
    try {
      const { delete: deleteCookie } = await cookies();
      deleteCookie('sessionId');
      return { success: true };
    } catch (error) {
      logger.error('Error logging out:', error);
      return { success: false, error: 'Something went wrong' };
    }
  });
