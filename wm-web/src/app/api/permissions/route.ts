import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

export const GET = withPermission(PERMISSIONS.ROLES_LIST, async (_req: NextRequest) => {
  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      resource: true,
      action: true,
    },
  });

  return NextResponse.json({ permissions });
});
