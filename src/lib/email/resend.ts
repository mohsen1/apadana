import { Resend } from 'resend';

import { LocalResend } from './local-resend';

/**
 * Get the Resend client.
 * If the e2e testing secret is not the same as the one in the environment,
 * or the email is a test email, use the local resend client.
 */
export function getResend(e2eTestingSecret: string | null, to: string) {
  if (e2eTestingSecret !== process.env.E2E_TESTING_SECRET || !to.endsWith('@example.com')) {
    return new LocalResend();
  }
  return new Resend(process.env.RESEND_API_KEY);
}
