import { NextResponse } from 'next/server';

import { generateAppleClientSecret } from '@/lib/apple-auth';

export async function GET() {
  const clientId = process.env.APPLE_CLIENT_ID;
  const redirectUri = `https://${process.env.VERCEL_URL}/api/auth/apple/callback`;

  const clientSecret = await generateAppleClientSecret();

  const url = new URL('https://appleid.apple.com/auth/authorize');
  url.searchParams.set('client_id', clientId ?? '');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'name email');
  url.searchParams.set('client_secret', clientSecret);

  return NextResponse.redirect(url);
}
