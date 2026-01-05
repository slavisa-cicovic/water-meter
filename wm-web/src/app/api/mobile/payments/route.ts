import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "src/services/billingService";
import { MobileService } from "src/services/mobileService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

export const GET = withPermission(PERMISSIONS.MOBILE_PAYMENTS_READ, async (req: NextRequest, _ctx, guard) => {
  const result = await MobileService.getLatestIssuedInvoice(guard.payload.accountId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
});

export const POST = withPermission(PERMISSIONS.MOBILE_PAYMENTS_PAY, async (req: NextRequest, _ctx, guard) => {
  const body = await req.json();
  const invoiceId = body?.invoiceId as string | undefined;
  if (!invoiceId) {
    return NextResponse.json({ success: false, error: "VALIDATION_FAILED" }, { status: 400 });
  }

  const result = await BillingService.markInvoicePaid({
    invoiceId,
    accountId: guard.payload.accountId,
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

  const data = (result as { data: { updated: number } }).data;
  return NextResponse.json({ success: true, data });
});
