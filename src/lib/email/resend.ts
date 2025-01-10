import { Resend } from 'resend';

import { LocalResend } from './local-resend';

/**
 * Check if the e2e testing secret is not the same as the one in the environment.
 * Local resend is used for testing purposes only.
 */
export function isUsingLocalResend(e2eTestingSecret: string | null) {
  return e2eTestingSecret !== process.env.E2E_TESTING_SECRET;
}

/**
 * Get the Resend client.
 * If the e2e testing secret is not the same as the one in the environment,
 * or the email is a test email, use the local resend client.
 */
export function getResend(e2eTestingSecret: string | null, to: string) {
  if (
    isUsingLocalResend(e2eTestingSecret) ||
    ['@e2e-testing.apadana.app', '@example.com'].some((emailDomain) => to.endsWith(emailDomain))
  ) {
    return new LocalResend();
  }
  return new Resend(process.env.RESEND_API_KEY);
}
