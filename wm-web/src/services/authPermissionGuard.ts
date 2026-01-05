import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { TokenService } from './tokenService';
import { AuthorizationService } from './authorizationService';
import { AccountTokenPayload } from 'src/types/accounts';

export type PermissionGuardOk = { ok: true; payload: AccountTokenPayload; permissions: string[] };
type GuardResult =
  | PermissionGuardOk
  | { ok: false; response: NextResponse };

export const requirePermission = async (
  req: NextRequest,
  permissionSlug: string
): Promise<GuardResult> => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return { ok: false, response: NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }) };
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = TokenService.parseAccountToken(token);
  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 }) };
  }

  const account = await prisma.account.findUnique({
    where: { id: payload.accountId },
    select: { permissionsVersion: true },
  });

  if (!account) {
    return { ok: false, response: NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 }) };
  }

  if (account.permissionsVersion !== payload.permissionsVersion) {
    return { ok: false, response: NextResponse.json({ error: 'STALE_TOKEN' }, { status: 401 }) };
  }

  const permissions = await AuthorizationService.resolveAccountPermissions(payload.accountId);
  if (!permissions.includes(permissionSlug)) {
    return { ok: false, response: NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }) };
  }

  return { ok: true, payload, permissions };
};
