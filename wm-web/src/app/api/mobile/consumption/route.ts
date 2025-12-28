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

const parseYear = (value: string | null) => {
  if (!value) return new Date().getUTCFullYear();
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    return null;
  }
  return parsed;
};

export const GET = async (req: NextRequest) => {
  const auth = getAuthPayload(req);
  if ("error" in auth) {
    const status = auth.error === "UNAUTHORIZED" ? 401 : 401;
    return NextResponse.json({ success: false, error: auth.error }, { status });
  }

  const year = parseYear(req.nextUrl.searchParams.get("year"));
  if (!year) {
    return NextResponse.json({ success: false, error: "INVALID_YEAR" }, { status: 400 });
  }

  const result = await MobileService.getConsumption(auth.payload.accountId, year);
  if (!result.success) {
    const status = result.error === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
