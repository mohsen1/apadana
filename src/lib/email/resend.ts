import { Resend } from 'resend';

import { LocalResend } from './local-resend';

export function isUsingLocalResend() {
  return (
    (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TEST_ENV === 'e2e') &&
    !process.env.VERCEL_URL?.includes('apadana.app')
  );
}

export function getResend() {
  if (isUsingLocalResend()) {
    return new LocalResend();
  }
  return new Resend(process.env.RESEND_API_KEY);
}
