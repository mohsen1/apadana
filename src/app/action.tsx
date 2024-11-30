'use server';

import { Resend } from 'resend';
import { z } from 'zod';

import { actionClient } from '@/lib/safe-action';

import EarlyAccessEmail from '@/components/emails/early-access-email';

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

const resend = new Resend(process.env.RESEND_API_KEY);
const GENERAL_AUDIENCE_ID = '4f99651b-4f7d-4fa8-9aec-2f0e8022cb46';

async function handler(data: Input) {
  try {
    const { email } = data;

    // Add email to Resend Audience
    await resend.contacts.create({
      email,
      audienceId: GENERAL_AUDIENCE_ID,
      unsubscribed: false,
    });

    // Send confirmation email
    await resend.emails.send({
      from: 'Apadana <onboarding@apadana.app>',
      to: email,
      subject: 'Welcome to Apadana Early Access',
      react: EarlyAccessEmail({ email }),
    });

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
