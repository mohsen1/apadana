'use server';

import { z } from 'zod';

import { sendEarlyAccessEmail } from '@/lib/email/send-email';
import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

import logger from '@/utils/logger';

// Schema for input validation
const InputSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type Input = z.infer<typeof InputSchema>;

// Schema for action response
const OutputSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
});

async function handler(data: Input) {
  try {
    const { email } = data;

    // Add email to list of early access signups
    await prisma.earlyAccessSignup.upsert({
      where: { email },
      update: { email },
      create: { email },
    });

    // Send confirmation email
    await sendEarlyAccessEmail(email);

    return { message: 'Successfully signed up for early access' };
  } catch (error) {
    logger.error('Early access signup error:', error);
    return { error: 'Error signing up for early access' };
  }
}

export const earlyAccessSignup = actionClient
  .schema(InputSchema)
  .outputSchema(OutputSchema)
  .action(async ({ parsedInput }) => {
    return await handler(parsedInput);
  });
