import { Resend } from 'resend';

import { LocalResend } from './local-resend';

export const isUsingLocalResend =
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TEST_ENV === 'e2e') &&
  !process.env.VERCEL_URL?.includes('apadana.app');

const resend = isUsingLocalResend ? new LocalResend() : new Resend(process.env.RESEND_API_KEY);

export default resend;
