import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
  const oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  });

  // Generate the Google OAuth login link
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'profile', 'email'],
  });

  return NextResponse.redirect(url.toString());
}
