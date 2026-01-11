import { NextRequest, NextResponse } from "next/server";
import { AiFaqService } from "src/services/aiFaqService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

const isSuperAdmin = (payload: { role: string; roles?: string[] }) => {
  const roles = payload.roles ?? [];
  return roles.includes("super_admin") || payload.role === "super_admin";
};

export const PUT = withPermission(PERMISSIONS.SETTINGS_UPDATE, async (req: NextRequest, ctx, guard) => {
  if (!isSuperAdmin(guard.payload)) {
    return NextResponse.json({ success: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await req.json();
  const id = ctx?.params?.id as string | undefined;
  if (!id) {
    return NextResponse.json({ success: false, error: "VALIDATION_FAILED" }, { status: 400 });
  }
  const result = await AiFaqService.update({ ...body, id });
  if (!result.success) {
    const status = result.error === "VALIDATION_FAILED" ? 400 : 500;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }
  return NextResponse.json({ success: true, data: result.data });
});
