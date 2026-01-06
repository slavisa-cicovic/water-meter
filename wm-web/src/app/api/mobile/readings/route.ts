import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "src/services/billingService";
import { MobileService } from "src/services/mobileService";
import { SettingsService } from "src/services/settingsService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";
import { ReadingCreateInput } from "src/types/readings";

type MobileReadingCreatePayload = Partial<ReadingCreateInput> & {
  accountId?: string;
  barcode?: string | null;
};

export const GET = withPermission(
  PERMISSIONS.MOBILE_READINGS_CONTEXT,
  async (req: NextRequest, _ctx, guard) => {
  const meterId = req.nextUrl.searchParams.get("meterId") ?? undefined;
  const result = await MobileService.getReadingContext(guard.payload.accountId, meterId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: result.data });
  }
);

export const POST = withPermission(
  PERMISSIONS.MOBILE_READINGS_CREATE,
  async (req: NextRequest, _ctx, guard) => {
  const body = (await req.json()) as MobileReadingCreatePayload;
  if (body.accountId && body.accountId !== guard.payload.accountId) {
    return NextResponse.json({ success: false, error: "ACCOUNT_MISMATCH" }, { status: 403 });
  }

  const effectiveDateResult = await SettingsService.getEffectiveDate();
  const effectiveDate = effectiveDateResult.success ? effectiveDateResult.data : new Date();

  const input: Omit<ReadingCreateInput, "readerAccountId"> = {
    meterId: body.meterId ?? "",
    readAt: effectiveDate.toISOString(),
    method: body.method as ReadingCreateInput["method"],
    value: body.value as number,
    originalValue: body.originalValue,
    imageFilename: body.imageFilename ?? null,
    barcodeRaw: body.barcode ?? null,
  };

  const result = await MobileService.createReading(guard.payload.accountId, input);

  if (!result.success) {
    const status =
      result.error === "VALIDATION_FAILED"
        ? 400
        : result.error === "ACCOUNT_NOT_FOUND"
        ? 404
        : result.error === "READER_FORBIDDEN"
        ? 403
        : 500;
    return NextResponse.json(
      { success: false, error: result.error, details: result.details },
      { status }
    );
  }

  try {
    await BillingService.generateDraftForMeter(input.meterId, effectiveDate);
  } catch (error) {
    console.error("[MobileReadings] Failed to generate draft invoice", error);
  }

  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  }
);
