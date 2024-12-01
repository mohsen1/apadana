import { Permission, UserRole } from '@prisma/client';
import _ from 'lodash';
import { Metadata } from 'next';

import { getUserFromSession } from '@/lib/auth';

import logger from '@/utils/logger';

export interface AuthProtection {
  /**
   * Whether authentication is required.
   * @default false
   */
  authRequired?: boolean;
  /**
   * The roles that are required to access the page.
   */
  roles?: UserRole[];
  /**
   * The permissions that are required to access the page.
   */
  permissions?: Permission[];
}

interface AuthMetadata extends Metadata {
  protection?: AuthProtection;
}

/**
 * Verifies if the user has access to the page based on the protection metadata.
 * @param metadata - The metadata for the page.
 * @returns Whether the user has access to the page.
 */
export async function verifyAccess(metadata: AuthMetadata) {
  const user = await getUserFromSession();
  const protection = metadata.protection;

  if (!protection) {
    return true;
  }

  if (protection.authRequired && !user) {
    return false;
  }

  if (_.intersection(protection.roles, user?.roles ?? []).length === 0) {
    logger.warn(`Role requirement not met for page ${metadata.title}`, {
      required: protection.roles,
      current: user?.roles,
      user: user?.id,
    });
    return false;
  }

  if (protection.permissions) {
    const hasPermission =
      _.intersection(
        protection.permissions,
        (user?.permissions ?? []).map((p) => p.permission),
      ).length > 0;

    if (!hasPermission) {
      logger.warn(`Permission requirement not met for page ${metadata.title}`, {
        required: protection.permissions,
        current: user?.permissions,
        user: user?.id,
      });
      return false;
    }
  }

  return true;
}
