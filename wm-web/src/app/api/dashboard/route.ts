import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { AuthorizationService } from 'src/services/authorizationService';
import { DashboardService } from 'src/services/dashboardService';
import { TokenService } from 'src/services/tokenService';
import { DashboardRole } from 'src/types/dashboard';

const resolveDashboardRole = (roles: string[]): DashboardRole | null => {
  if (roles.includes('super_admin') || roles.includes('admin')) return 'admin';
  if (roles.includes('staff_backoffice')) return 'staff_backoffice';
  if (roles.includes('manager')) return 'manager';
  return null;
};

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = TokenService.parseAccountToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 });
  }

  const account = await prisma.account.findUnique({
    where: { id: payload.accountId },
    select: { permissionsVersion: true },
  });

  if (!account || account.permissionsVersion !== payload.permissionsVersion) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 });
  }

  const roles = await AuthorizationService.getRoleSlugsForAccount(payload.accountId);
  const roleCandidates = roles.length ? roles : payload.role ? [payload.role] : [];
  const dashboardRole = resolveDashboardRole(roleCandidates);

  if (!dashboardRole) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const data = await DashboardService.getDashboardData({ role: dashboardRole });
  return NextResponse.json(data);
};
