import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from 'src/services/dashboardService';
import { withPermission } from 'src/services/permissionGuard';
import { PERMISSIONS } from 'src/constants/permissions';

export const GET = withPermission(PERMISSIONS.DASHBOARD_READ, async (_req: NextRequest) => {
  const data = await DashboardService.getDashboardData();
  return NextResponse.json(data);
});
