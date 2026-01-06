import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

export const GET = withPermission(PERMISSIONS.ROLES_LIST, async (_req: NextRequest) => {
  const accountsWithoutRoles = await prisma.account.count({
    where: { accountRoleLinks: { none: {} } },
  });

  const rolesWithoutPermissions = await prisma.role.count({
    where: { rolePermissions: { none: {} } },
  });

  return NextResponse.json({
    ok: accountsWithoutRoles === 0,
    accountsWithoutRoles,
    rolesWithoutPermissions,
  });
});
