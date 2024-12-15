import { Resend } from 'resend';

/**
 * Here we use a dynamic import to avoid importing the local-resend module in the main entry file
 * when building for production.
 */
function getLocalResend() {
  type ResendModule = typeof import('@/lib/email/local-resend');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LocalResend } = require('@/lib/email/local-resend') as ResendModule;
  return new LocalResend();
}

export const isUsingLocalResend =
  (process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_TEST_ENV === 'e2e') &&
  !process.env.VERCEL_URL?.includes('apadana.app');

const resend = isUsingLocalResend
  ? getLocalResend()
  : new Resend(process.env.RESEND_API_KEY);

export default resend;
