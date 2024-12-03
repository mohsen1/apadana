import _ from 'lodash';

import { getUserInServer } from '@/lib/auth';

import { ClientUser } from '@/contexts/auth-context';

/**
 * Sanitize a user for client side use. `getUserFromSession` is used for server side
 * code, but we need to sanitize the user for client side code.
 */
export function sanitizeUserForClient(
  user: Awaited<ReturnType<typeof getUserInServer>>,
): ClientUser | null {
  if (!user) {
    return null;
  }
  const email = user.emailAddresses[0].emailAddress;

  return {
    ..._.pick(user, ['id', 'firstName', 'lastName', 'imageUrl']),
    email,
  };
}
