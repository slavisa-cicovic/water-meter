import prisma from 'src/utils/prisma';

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

    const allowedRoles = new Set<string>();
    let hasUnrestricted = false;
    for (const rolePermission of rolePermissions) {
      const conditions = rolePermission.conditions as
        | { accounts?: { visibility?: { allowedRoles?: string[] } }; accountRoles?: string[] }
        | null;
      const allowedRoleSlugs =
        conditions?.accounts?.visibility?.allowedRoles ??
        conditions?.accountRoles?.map((role) => role.toString());
      if (!allowedRoleSlugs || allowedRoleSlugs.length === 0) {
        hasUnrestricted = true;
        continue;
      }
      if (allowedRoleSlugs.length) {
        for (const role of allowedRoleSlugs) {
          allowedRoles.add(role);
        }
      }
    }

    if (hasUnrestricted) return null;
    return allowedRoles.size ? Array.from(allowedRoles) : null;
  },

  async getRoleIdsForAccount(accountId: string) {
    const roleLinks = await prisma.accountRoleLink.findMany({
      where: { accountId },
      select: { roleId: true },
    });

    return roleLinks.map((link) => link.roleId);
  },

  async getRoleSlugsForAccount(accountId: string) {
    const roleLinks = await prisma.accountRoleLink.findMany({
      where: { accountId },
      orderBy: { role: { slug: 'asc' } },
      select: { role: { select: { slug: true } } },
    });

    return roleLinks.map((link) => link.role.slug).filter((slug): slug is string => Boolean(slug));
  },
};
