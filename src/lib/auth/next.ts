import { Permission, Role } from '@prisma/client';
import _ from 'lodash';

import { getUserInServer } from '@/lib/auth';

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
  roles?: Role[];
  /**
   * The permissions that are required to access the page.
   */
  permissions?: Permission[];
}

/**
 * Verifies if the user has access to the page based on the protection metadata.
 * @param metadata - The metadata for the page.
 * @returns Whether the user has access to the page.
 */
export async function verifyAccess(protection: AuthProtection) {
  const user = await getUserInServer();

  if (!protection) {
    return true;
  }

  if (protection.authRequired && !user) {
    return false;
  }

  if (protection.roles) {
    const userRoles = user?.roles.map((r) => r.role) ?? [];
    const hasRole = _.intersection(protection.roles, userRoles).length === protection.roles.length;

    if (!hasRole) {
      logger.warn(`Role requirement not met`, {
        required: protection.roles,
        current: user?.roles,
        user: user?.id,
      });

      return false;
    }
  }

  if (protection.permissions) {
    const userPermissions = user?.permissions.map((p) => p.permission) ?? [];
    const hasPermission =
      _.intersection(protection.permissions, userPermissions).length ===
      protection.permissions.length;

    if (!hasPermission) {
      logger.warn(`Permission requirement not met`, {
        required: protection.permissions,
        current: user?.permissions,
        user: user?.id,
      });

      return false;
    }
  }

  return true;
}
