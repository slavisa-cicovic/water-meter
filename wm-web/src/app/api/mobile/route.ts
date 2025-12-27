import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
import { TokenService } from "src/services/tokenService";
import type { MobileProfileUpdateInput } from "src/types/mobile";

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
    const status = auth.error === "UNAUTHORIZED" ? 401 : 401;
    return NextResponse.json({ success: false, error: auth.error }, { status });
  }

  const result = await MobileService.getAccount(auth.payload.accountId);
  if (!result.success) {
    const status = result.error === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};

export const PUT = async (req: NextRequest) => {
  const auth = getAuthPayload(req);
  if ("error" in auth) {
    const status = auth.error === "UNAUTHORIZED" ? 401 : 401;
    return NextResponse.json({ success: false, error: auth.error }, { status });
  }

  const body = (await req.json()) as MobileProfileUpdateInput;
  const result = await MobileService.updateProfile(auth.payload.accountId, body);

  if (!result.success) {
    const status =
      result.error === "NOT_FOUND"
        ? 404
        : result.error === "VALIDATION_FAILED"
        ? 400
        : result.error === "ACCOUNT_EXISTS"
        ? 409
        : 500;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
