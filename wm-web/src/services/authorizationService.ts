import prisma from 'src/utils/prisma';
import { AccountRole } from '@prisma/client';

export const AuthorizationService = {
  async resolveAccountPermissions(accountId: string) {
    const roleIds = await this.getRoleIdsForAccount(accountId);
    if (!roleIds.length) return [];

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      select: {
        permission: {
          select: { slug: true },
        },
      },
    });

    const permissions = new Set<string>();
    for (const rolePermission of rolePermissions) {
      permissions.add(rolePermission.permission.slug);
    }

    return Array.from(permissions);
  },

  async getAccountPermissionsSnapshot(accountId: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { permissionsVersion: true },
    });

    if (!account) return null;

    const permissions = await this.resolveAccountPermissions(accountId);
    return { permissionsVersion: account.permissionsVersion, permissions };
  },

  async resolveAllowedAccountRoles(accountId: string, permissionSlug: string) {
    const roleIds = await this.getRoleIdsForAccount(accountId);
    if (!roleIds.length) return null;

    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: { in: roleIds },
        permission: { slug: permissionSlug },
      },
      select: { conditions: true },
    });

    const allowedRoles = new Set<AccountRole>();
    for (const rolePermission of rolePermissions) {
      const conditions = rolePermission.conditions as { accountRoles?: AccountRole[] } | null;
      if (conditions?.accountRoles?.length) {
        for (const role of conditions.accountRoles) {
          allowedRoles.add(role);
        }
      }
    }

    return allowedRoles.size ? Array.from(allowedRoles) : null;
  },

  async getRoleIdsForAccount(accountId: string) {
    const roleLinks = await prisma.accountRoleLink.findMany({
      where: { accountId },
      select: { roleId: true },
    });

    if (roleLinks.length) {
      return roleLinks.map((link) => link.roleId);
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { role: true },
    });

    if (!account) return [];

    const role = await prisma.role.findUnique({
      where: { slug: account.role },
      select: { id: true },
    });

    return role ? [role.id] : [];
  },
};
