import { EmailAddress, User } from '@prisma/client';

/**
 * Get the primary email address of a user.
 * @param user - The user to get the email address from.
 * @returns The primary email address of the user.
 */
export function getUserEmail(user?: User & { emailAddresses: EmailAddress[] }) {
  return user?.emailAddresses
    .filter((email) => email.isPrimary)
    .map((email) => email.emailAddress)
    .at(0);
}
