import { NextRequest, NextResponse } from "next/server";
import { AiFaqService } from "src/services/aiFaqService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

const isSuperAdmin = (payload: { role: string; roles?: string[] }) => {
  const roles = payload.roles ?? [];
  return roles.includes("super_admin") || payload.role === "super_admin";
};

export const GET = withPermission(PERMISSIONS.SETTINGS_READ, async (_req: NextRequest, _ctx, guard) => {
  if (!isSuperAdmin(guard.payload)) {
    return NextResponse.json({ success: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const result = await AiFaqService.listAll();
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: result.data });
});

export const POST = withPermission(PERMISSIONS.SETTINGS_UPDATE, async (req: NextRequest, _ctx, guard) => {
  if (!isSuperAdmin(guard.payload)) {
    return NextResponse.json({ success: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await req.json();
  const result = await AiFaqService.create(body);
  if (!result.success) {
    const status = result.error === "VALIDATION_FAILED" ? 400 : 500;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }
  return NextResponse.json({ success: true, data: result.data });
});
