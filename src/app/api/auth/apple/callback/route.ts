import { NextRequest, NextResponse } from 'next/server';

import { exchangeAppleCodeForTokens, getAppleProfile } from '@/lib/apple-auth';
import { setServerSession } from '@/lib/auth';
import { SESSION_DURATION } from '@/lib/auth/constants';
import prisma from '@/lib/prisma/client';

import { assertError } from '@/utils';
import logger from '@/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(
        `https://${process.env.VERCEL_URL}/signin?error=apple_oauth`,
      );
    }

    // Exchange the code for tokens (similar approach as with Google)
    const tokens = await exchangeAppleCodeForTokens(code);
    if (!tokens?.id_token) {
      return NextResponse.redirect(
        `https://${process.env.VERCEL_URL}/signin?error=apple_no_token`,
      );
    }

    // Get user profile from Apple (sub, email, name, etc.)
    const { email, firstName, lastName } = await getAppleProfile(
      tokens.id_token,
    );
    if (!email) {
      return NextResponse.redirect(
        `https://${process.env.VERCEL_URL}/signin?error=apple_no_email`,
      );
    }

    // Upsert user in database
    let user = await prisma.user.findFirst({
      where: { emailAddresses: { some: { emailAddress: email } } },
      include: { sessions: true, emailAddresses: true },
    });

    if (!user) {
      user = await prisma.user.create({
        include: { emailAddresses: true, sessions: true },
        data: {
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          emailAddresses: {
            create: [{ emailAddress: email, isPrimary: true }],
          },
          sessions: {
            create: {
              expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
            },
          },
        },
      });
    }

    // Create fresh session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
      },
    });

    await setServerSession(session);

    // Redirect user (adjust as needed)
    return NextResponse.redirect(`https://${process.env.VERCEL_URL}/`);
  } catch (error) {
    assertError(error);
    logger.error('Apple Auth callback error:', error);
    return NextResponse.redirect(
      `https://${process.env.VERCEL_URL}/signin?error=apple_oauth`,
    );
  }
}
