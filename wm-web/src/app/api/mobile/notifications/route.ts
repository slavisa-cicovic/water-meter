import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

export const GET = withPermission(
  PERMISSIONS.MOBILE_NOTIFICATIONS_READ,
  async (req: NextRequest, _ctx, guard) => {
  const result = await MobileService.getNotifications(guard.payload.accountId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
  }
);
