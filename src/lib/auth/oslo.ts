import { Argon2id } from 'oslo/password';
import { TimeSpan } from 'oslo/time';

export const SESSION_DURATION = new TimeSpan('2w'); // 2 weeks
export const RESET_TOKEN_DURATION = new TimeSpan('1h'); // 1 hour

export const argon = new Argon2id();
