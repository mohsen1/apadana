import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma/client';

import logger from '@/utils/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const email = searchParams.get('email');

  if (!code || !email) {
    redirect('/user/profile?error=invalid-verification');
  }

  try {
    const emailAddress = await prisma.emailAddress.findFirst({
      where: {
        emailAddress: email,
        verification: code,
      },
    });

    if (!emailAddress) {
      redirect('/user/profile?error=invalid-verification');
    }

    await prisma.emailAddress.update({
      where: { id: emailAddress.id },
      data: {
        verification: null,
        verified: true,
      },
    });

    logger.info('Email verified successfully', { emailId: emailAddress.id });
    redirect('/user/profile?success=email-verified');
  } catch (error) {
    logger.error('Error verifying email', { error });
    redirect('/user/profile?error=verification-failed');
  }
}
