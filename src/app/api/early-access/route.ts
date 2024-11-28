import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import EarlyAccessEmail from '@/components/emails/early-access-email';

import logger from '@/utils/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

const GENERAL_AUDIENCE_ID = '4f99651b-4f7d-4fa8-9aec-2f0e8022cb46';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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

    return NextResponse.json(
      { message: 'Successfully signed up for early access' },
      { status: 200 },
    );
  } catch (error) {
    logger.error('Early access signup error:', error);
    return NextResponse.json(
      { error: 'Error signing up for early access' },
      { status: 500 },
    );
  }
}
