import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "src/services/settingsService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

export const GET = withPermission(PERMISSIONS.SETTINGS_READ, async (req: NextRequest) => {
  const result = await SettingsService.getSettings();
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
});

export const PUT = withPermission(PERMISSIONS.SETTINGS_UPDATE, async (req: NextRequest, _ctx, guard) => {
  const body = await req.json();
  const roles = guard.payload.roles ?? [];
  const primaryRole = guard.payload.role;
  const isSuperAdmin = roles.includes("super_admin") || primaryRole === "super_admin";
  if (body?.key === "ai.systemPrompt" && !isSuperAdmin) {
    return NextResponse.json({ success: false, error: "FORBIDDEN" }, { status: 403 });
  }
  const result = await SettingsService.updateSetting(body);
  if (!result.success) {
    const status = result.error === "VALIDATION_FAILED" ? 400 : 500;
    return NextResponse.json(
      { success: false, error: result.error, details: result.details },
      { status }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
});
