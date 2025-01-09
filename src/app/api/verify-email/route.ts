import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma/client';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';
import { createProfileUrl } from '@/utils/url';

const logger = createLogger();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const email = searchParams.get('email');

  const redirectSearchParams = new URLSearchParams();

  try {
    if (!code) {
      redirectSearchParams.set('error', 'no-verification-code');
      throw new Error('Code is required');
    }

    if (!email) {
      redirectSearchParams.set('error', 'no-email');
      throw new Error('Email is required');
    }

    const emailAddress = await prisma.emailAddress.findFirst({
      where: {
        emailAddress: email,
        verification: code,
      },
    });

    if (!emailAddress) {
      redirectSearchParams.set('error', 'invalid-verification-code');
      throw new Error('Email address not found');
    }

    await prisma.emailAddress.update({
      where: { id: emailAddress.id },
      data: {
        verification: null,
        verified: true,
      },
    });

    logger.info('Email verified successfully', { emailId: emailAddress.id });
  } catch (error) {
    assertError(error);
    logger.error('Error verifying email', { error });

    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TEST_ENV === 'e2e') {
      redirectSearchParams.set('error_message', error.message);
    }
  }

  if (!redirectSearchParams.has('error')) {
    redirectSearchParams.set('success', 'email-verified');
  }

  redirect(createProfileUrl(redirectSearchParams));
}
