import { EmailAddress, Role, User, UserRole } from '@prisma/client';
import _ from 'lodash';

import { ClientUser } from '@/contexts/auth-context';

/**
 * Sanitize a user for client side use. `getUserFromSession` is used for server side
 * code, but we need to sanitize the user for client side code.
 */
export function sanitizeUserForClient(
  user: User & { emailAddresses: EmailAddress[]; roles: UserRole[] },
): ClientUser | null {
  if (!user) return null;

  const primaryEmail = user.emailAddresses.find((e) => e.isPrimary)?.emailAddress;
  if (!primaryEmail) return null;
  const isAdmin = user.roles.some((role) => role.role === Role.ADMIN);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    email: primaryEmail,
    emailAddresses: user.emailAddresses,
    isAdmin,
  };
}
