import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

export const GET = withPermission(PERMISSIONS.ROLES_LIST, async (_req: NextRequest) => {
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    select: { slug: true, name: true },
  });

  return NextResponse.json({ roles });
});
