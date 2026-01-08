import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";
import type { MobileLocaleUpdateInput } from "src/types/mobile";

export const PUT = withPermission(PERMISSIONS.MOBILE_PROFILE_UPDATE, async (req: NextRequest, _ctx, guard) => {
  const body = (await req.json()) as MobileLocaleUpdateInput;
  const result = await MobileService.updateLocale(guard.payload.accountId, body);

  if (!result.success) {
    const status = result.error === "NOT_FOUND" ? 404 : result.error === "VALIDATION_FAILED" ? 400 : 500;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
});
