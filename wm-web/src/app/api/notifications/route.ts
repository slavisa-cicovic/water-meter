import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { NotificationService } from 'src/services/notificationService';

export const GET = withPermission(PERMISSIONS.NOTIFICATIONS_READ, async (req: NextRequest) => {
  const result = await NotificationService.getSummary();

  return NextResponse.json(result.data);
});
