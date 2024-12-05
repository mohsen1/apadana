import { TimeSpan } from 'oslo';

export const SESSION_COOKIE_NAME = getSessionCookieName();
export const SESSION_DURATION = new TimeSpan(2, 'w'); // 2 weeks
export const RESET_TOKEN_DURATION = new TimeSpan(1, 'h'); // 1 hour

function getSessionCookieName() {
  const { VERCEL_URL, NODE_ENV, TEST_ENV } = process.env;
  const publicUrl = VERCEL_URL.startsWith('localhost')
    ? `http://${VERCEL_URL}`
    : `https://${VERCEL_URL}`;
  const url = new URL(publicUrl);

  return `session_id_${url.hostname}_${TEST_ENV || NODE_ENV}`;
}
