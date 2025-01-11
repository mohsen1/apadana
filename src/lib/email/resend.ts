import { Resend } from 'resend';

import { createLogger } from '@/utils/logger';

import { LocalResend } from './local-resend';

const logger = createLogger('resend');

/**
 * Get the Resend client.
 * Use LocalResend for:
 * 1. Development environment
 * 2. E2E testing with valid secret
 * 3. Test emails (@example.com)
 */
export function getResend(e2eTestingSecret: string | null, to: string) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isE2eTesting = process.env.NEXT_PUBLIC_TEST_ENV === 'e2e';
  const validE2eTestingSecret = e2eTestingSecret === process.env.E2E_TESTING_SECRET;
  const isTestEmail = to.endsWith('@example.com') || to.endsWith('@apadana.app');

  // Use LocalResend for development or valid E2E testing
  if (isDevelopment || (isE2eTesting && validE2eTestingSecret) || isTestEmail) {
    logger.info('Using local resend client for email', { to });
    return new LocalResend();
  }

  return new Resend(process.env.RESEND_API_KEY);
}
