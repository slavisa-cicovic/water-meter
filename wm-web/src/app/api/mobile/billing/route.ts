import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

const parseYear = (value: string | null) => {
  if (!value) return new Date().getUTCFullYear();
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    return null;
  }
  return parsed;
};

export const GET = withPermission(PERMISSIONS.MOBILE_BILLING_READ, async (req: NextRequest, _ctx, guard) => {
  const year = parseYear(req.nextUrl.searchParams.get("year"));
  if (!year) {
    return NextResponse.json({ success: false, error: "INVALID_YEAR" }, { status: 400 });
  }

  const result = await MobileService.getBilling(guard.payload.accountId, year);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
});
