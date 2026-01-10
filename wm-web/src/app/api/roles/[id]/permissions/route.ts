import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { Prisma } from '@prisma/client';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

type RolePermissionUpdate = {
  permissionSlug: string;
  enabled: boolean;
  conditions?: {
    accounts?: {
      visibility?: {
        allowedRoles?: string[];
      };
    };
  };
};

const hasValidConditions = (conditions: RolePermissionUpdate['conditions']) => {
  if (!conditions) return true;
  const allowedRoles = conditions.accounts?.visibility?.allowedRoles;
  if (allowedRoles === undefined) return true;
  return Array.isArray(allowedRoles) && allowedRoles.every((role) => typeof role === 'string');
};

export const PATCH = withPermission(PERMISSIONS.ROLES_UPDATE, async (req: NextRequest, ctx: any, guard) => {
  const params = await ctx?.params;
  const roleId = params?.id as string | undefined;
  if (!roleId) {
    return NextResponse.json({ error: 'INVALID_ROLE' }, { status: 400 });
  }

  const body = await req.json();
  const updates = Array.isArray(body?.updates) ? (body.updates as RolePermissionUpdate[]) : null;
  if (!updates) {
    return NextResponse.json({ error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  for (const update of updates) {
    if (!update || typeof update.permissionSlug !== 'string' || typeof update.enabled !== 'boolean') {
      return NextResponse.json({ error: 'VALIDATION_FAILED' }, { status: 400 });
    }
    if (!hasValidConditions(update.conditions)) {
      return NextResponse.json({ error: 'INVALID_CONDITIONS' }, { status: 400 });
    }
  }

  const role = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true, slug: true } });
  if (!role) {
    return NextResponse.json({ error: 'ROLE_NOT_FOUND' }, { status: 404 });
  }

  const permissionSlugs = updates.map((update) => update.permissionSlug);
  const permissions = await prisma.permission.findMany({
    where: { slug: { in: permissionSlugs } },
    select: { id: true, slug: true },
  });

  const permissionBySlug = new Map(permissions.map((permission) => [permission.slug, permission]));
  if (permissionBySlug.size !== permissionSlugs.length) {
    return NextResponse.json({ error: 'UNKNOWN_PERMISSION' }, { status: 400 });
  }

  const beforePermissions = await prisma.rolePermission.findMany({
    where: { roleId: role.id },
    select: {
      conditions: true,
      permission: { select: { slug: true } },
    },
  });

  const beforeSnapshot = beforePermissions.map((entry) => ({
    slug: entry.permission.slug,
    conditions: entry.conditions,
  }));

  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      const permission = permissionBySlug.get(update.permissionSlug);
      if (!permission) continue;

      if (update.enabled) {
        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: role.id, permissionId: permission.id },
          },
          update: { conditions: update.conditions ?? Prisma.JsonNull },
          create: {
            roleId: role.id,
            permissionId: permission.id,
            ...(update.conditions ? { conditions: update.conditions } : {}),
          },
        });
      } else {
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id, permissionId: permission.id },
        });
      }
    }

    const afterPermissions = await tx.rolePermission.findMany({
      where: { roleId: role.id },
      select: {
        conditions: true,
        permission: { select: { slug: true } },
      },
    });

    const afterSnapshot = afterPermissions.map((entry) => ({
      slug: entry.permission.slug,
      conditions: entry.conditions,
    }));

    await tx.rolePermissionAuditLog.create({
      data: {
        actorId: guard.payload.accountId,
        roleId: role.id,
        before: beforeSnapshot,
        after: afterSnapshot,
      },
    });

    const accounts = await tx.account.findMany({
      where: {
        accountRoleLinks: { some: { roleId: role.id } },
      },
      select: { id: true },
    });

    if (accounts.length) {
      await tx.account.updateMany({
        where: { id: { in: accounts.map((account) => account.id) } },
        data: { permissionsVersion: { increment: 1 } },
      });
    }
  });

  return NextResponse.json({ success: true });
});
