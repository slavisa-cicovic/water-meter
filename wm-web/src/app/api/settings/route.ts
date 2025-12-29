import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "src/services/settingsService";
import { TokenService } from "src/services/tokenService";

const getSettingsPayload = (req: NextRequest, options?: { allowStaff?: boolean }) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: "UNAUTHORIZED" as const };
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = TokenService.parseAccountToken(token);
  if (!payload) {
    return { error: "INVALID_TOKEN" as const };
  }

  if (payload.role !== "admin" && !(options?.allowStaff && payload.role === "staff_backoffice")) {
    return { error: "FORBIDDEN" as const };
  }

  return { payload };
};

export const GET = async (req: NextRequest) => {
  const auth = getSettingsPayload(req, { allowStaff: true });
  if ("error" in auth) {
    const status = auth.error === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ success: false, error: auth.error }, { status });
  }

  const result = await SettingsService.getSettings();
  return NextResponse.json({ success: true, data: result.data });
};

export const PUT = async (req: NextRequest) => {
  const auth = getSettingsPayload(req);
  if ("error" in auth) {
    const status = auth.error === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ success: false, error: auth.error }, { status });
  }

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
};
