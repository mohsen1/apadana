import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma/client';

import logger from '@/utils/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const email = searchParams.get('email');

  let redirectUrl = '/user/profile?success=email-verified';

  if (!code || !email) {
    redirectUrl = '/user/profile?error=invalid-verification';
  }

  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const emailAddress = await prisma.emailAddress.findFirst({
      where: {
        emailAddress: email,
        verification: code,
      },
    });

    if (!emailAddress) {
      redirectUrl = '/user/profile?error=invalid-verification';
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
    logger.error('Error verifying email', { error });
    redirectUrl = '/user/profile?error=verification-failed';
  }

  redirect(redirectUrl);
}
