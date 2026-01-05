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

export const PUT = withPermission(PERMISSIONS.SETTINGS_UPDATE, async (req: NextRequest) => {
  const body = await req.json();
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
