import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
import { TokenService } from "src/services/tokenService";

const getAuthPayload = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { error: "UNAUTHORIZED" as const };
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = TokenService.parseAccountToken(token);
  if (!payload) {
    return { error: "INVALID_TOKEN" as const };
  }

  return { payload };
};

export const GET = async (req: NextRequest) => {
  const auth = getAuthPayload(req);
  if ("error" in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const result = await MobileService.getStaffMeters(auth.payload.role);
  if (!result.success) {
    const status = result.error === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
