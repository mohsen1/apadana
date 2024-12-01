'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { argon, SESSION_DURATION } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { actionClient, ClientVisibleError } from '@/lib/safe-action';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const successfulLogin = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
});

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
      },
    });

    // Check if user exists and has password
    if (!user || !user.password) {
      throw new ClientVisibleError('Invalid email or password');
    }

    // Verify password
    const validPassword = await argon.verify(
      user.password,
      parsedInput.password,
    );
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
    const primaryEmail = user.emailAddresses.find(
      (e) => e.isPrimary,
    )?.emailAddress;

    if (!primaryEmail) {
      throw new Error('Primary email not found');
    }

    await ctx.setSession(session);

    return {
      user: {
        id: user.id,
        email: primaryEmail,
      },
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
  success: z.literal(true),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
  }),
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
      throw new Error(
        'There is already an account with this email. Please login with that email.',
      );
    }

    const hashedPassword = await argon.hash(parsedInput.password);
    const user = await prisma.user.create({
      include: {
        emailAddresses: true,
        sessions: true,
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

    await ctx.setSession(user.sessions[0]);

    // Send welcome email
    await sendWelcomeEmail(parsedInput.email);

    return {
      success: true,
      user: {
        id: user.id,
        email: parsedInput.email,
      },
    };
  });

const clientUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export type ClientUser = z.infer<typeof clientUserSchema>;

const getCurrentUserOutput = z
  .object({
    user: clientUserSchema.nullable(),
  })
  .nullable();

export const getCurrentUser = actionClient
  .outputSchema(getCurrentUserOutput)
  .action(async () => {
    const { get: getCookie, delete: deleteCookie } = await cookies();
    const sessionId = getCookie('sessionId');

    if (!sessionId) {
      return { user: null };
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId.value },
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
      return { user: null };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.emailAddresses[0]?.emailAddress,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        imageUrl: session.user.imageUrl,
      },
    };
  });

export const logOut = actionClient
  .outputSchema(z.object({ success: z.literal(true) }))
  .action(async () => {
    const { delete: deleteCookie } = await cookies();
    deleteCookie('sessionId');
    return { success: true };
  });
