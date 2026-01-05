import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

export const GET = withPermission(PERMISSIONS.MOBILE_METERS_LIST, async (req: NextRequest, _ctx, guard) => {
  const result = await MobileService.getStaffMeters(guard.payload.role);
  if (!result.success) {
    const status = result.error === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
});
