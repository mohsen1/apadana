import { Resend } from 'resend';

import { createLogger } from '@/utils/logger';

import { LocalResend } from './local-resend';

const logger = createLogger('resend');

/**
 * Get the Resend client.
 * If the e2e testing secret is not the same as the one in the environment,
 * or the email is a test email, use the local resend client.
 */
export function getResend(e2eTestingSecret: string | null, to: string) {
  const validE2eTestingSecret = e2eTestingSecret === process.env.E2E_TESTING_SECRET;
  const isTestEmail = to.endsWith('@example.com');
  const isE2eTesting = process.env.NEXT_PUBLIC_TEST_ENV === 'e2e';

  if (validE2eTestingSecret && isTestEmail && isE2eTesting) {
    logger.info('Using local resend client for email', { to });
    return new LocalResend();
  }

  return new Resend(process.env.RESEND_API_KEY);
}
