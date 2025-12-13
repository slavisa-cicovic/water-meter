import { NextRequest, NextResponse } from "next/server";
import { TokenService } from "./tokenService";
import { AccountRole } from "src/types/accounts";

type GuardResult = { ok: true; role: AccountRole } | { ok: false; response: NextResponse };

export const requireAccountsAccess = (req: NextRequest): GuardResult => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { ok: false, response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = TokenService.parseAccountToken(token);

  if (!payload) {
    return { ok: false, response: NextResponse.json({ error: "INVALID_TOKEN" }, { status: 401 }) };
  }

  if (payload.role !== "admin" && payload.role !== "staff_backoffice") {
    return { ok: false, response: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }

  return { ok: true, role: payload.role };
};
