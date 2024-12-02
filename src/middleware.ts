import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isUsingLocalResend } from '@/lib/email/resend';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/local-inbox') && !isUsingLocalResend) {
    return NextResponse.redirect('/');
  }
  return NextResponse.next();
}
