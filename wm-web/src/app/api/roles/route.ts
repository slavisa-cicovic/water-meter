import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

export const GET = withPermission(PERMISSIONS.ROLES_LIST, async (_req: NextRequest) => {
  const includePermissions = _req.nextUrl.searchParams.get('includePermissions') === '1';

  if (includePermissions) {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        isSystem: true,
        rolePermissions: {
          select: {
            conditions: true,
            permission: { select: { slug: true, name: true, resource: true, action: true } },
          },
        },
      },
    });

    const rolesWithPermissions = roles.map((role) => ({
      id: role.id,
      slug: role.slug,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.rolePermissions.map((entry) => ({
        slug: entry.permission.slug,
        name: entry.permission.name,
        resource: entry.permission.resource,
        action: entry.permission.action,
        conditions: entry.conditions,
      })),
    }));

    return NextResponse.json({ roles: rolesWithPermissions });
  }

  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    select: { slug: true, name: true },
  });

  return NextResponse.json({ roles });
});

export const POST = withPermission(PERMISSIONS.ROLES_CREATE, async (req: NextRequest) => {
  const body = await req.json();
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : null;

  if (!slug || !name) {
    return NextResponse.json({ error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  const existing = await prisma.role.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'ROLE_EXISTS' }, { status: 409 });
  }

  const role = await prisma.role.create({
    data: {
      slug,
      name,
      description: description || null,
      isSystem: false,
    },
    select: { id: true, slug: true, name: true, description: true, isSystem: true },
  });

  return NextResponse.json({ role }, { status: 201 });
});
