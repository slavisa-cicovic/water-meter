import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "src/services/billingService";
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

  const result = await MobileService.getLatestIssuedInvoice(auth.payload.accountId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
};

export const POST = async (req: NextRequest) => {
  const auth = getAuthPayload(req);
  if ("error" in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const body = await req.json();
  const invoiceId = body?.invoiceId as string | undefined;
  if (!invoiceId) {
    return NextResponse.json({ success: false, error: "VALIDATION_FAILED" }, { status: 400 });
  }

  const result = await BillingService.markInvoicePaid({
    invoiceId,
    accountId: auth.payload.accountId,
  });

  if (!result.success) {
    const status =
      result.error === "NOT_FOUND"
        ? 404
        : result.error === "FORBIDDEN"
        ? 403
        : result.error === "INVALID_STATUS"
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
