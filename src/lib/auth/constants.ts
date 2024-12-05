import { TimeSpan } from 'oslo';

export const SESSION_COOKIE_NAME = getSessionCookieName();
export const SESSION_DURATION = new TimeSpan(2, 'w'); // 2 weeks
export const RESET_TOKEN_DURATION = new TimeSpan(1, 'h'); // 1 hour

function getSessionCookieName() {
  const { NEXT_PUBLIC_DOMAIN, NODE_ENV, TEST_ENV } = process.env;
  const url = new URL(NEXT_PUBLIC_DOMAIN);

  return `session_id_${url.hostname}_${TEST_ENV || NODE_ENV}`;
}
