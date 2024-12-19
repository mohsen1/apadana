import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

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
        `https://${process.env.VERCEL_URL}/signin?error=google_oauth`,
      );
    }

    // Use same clientId, clientSecret, and redirectUri as in google/route.ts
    const oauth2Client = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `https://${process.env.VERCEL_URL}/api/auth/google/callback`,
    });

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const googleRes = await oauth2.userinfo.v2.me.get();
    const { email, given_name, family_name, picture } = googleRes.data;

    if (!email) {
      return NextResponse.redirect(
        `https://${process.env.VERCEL_URL}/signin?error=google_no_email`,
      );
    }

    // Upsert user in database
    let user = await prisma.user.findFirst({
      where: { emailAddresses: { some: { emailAddress: email } } },
      include: { sessions: true, emailAddresses: true },
    });
    if (!user) {
      user = await prisma.user.create({
        include: {
          emailAddresses: true,
          sessions: true,
        },
        data: {
          firstName: given_name ?? '',
          lastName: family_name ?? '',
          imageUrl: picture ?? null,
          emailAddresses: {
            create: [
              {
                emailAddress: email,
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
    }

    // Create or refresh session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION.milliseconds()),
      },
    });

    await setServerSession(session);

    // Redirect user to home
    return NextResponse.redirect(`https://${process.env.VERCEL_URL}/`);
  } catch (error) {
    assertError(error);
    logger.error('Google Auth callback error:', error);
    return NextResponse.redirect(
      `https://${process.env.VERCEL_URL}/signin?error=google_oauth`,
    );
  }
}
