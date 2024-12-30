import { TimeSpan } from 'oslo';

export const SESSION_COOKIE_NAME = 'session_id';
export const SESSION_DURATION = new TimeSpan(2, 'w'); // 2 weeks
export const RESET_TOKEN_DURATION = new TimeSpan(1, 'h'); // 1 hour
export const E2E_TESTING_SECRET_HEADER = 'x-e2e-testing-secret';
