import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "src/services/billingService";
import { MobileService } from "src/services/mobileService";
import { SettingsService } from "src/services/settingsService";
import { TokenService } from "src/services/tokenService";
import { ReadingCreateInput } from "src/types/readings";

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

type MobileReadingCreatePayload = Partial<ReadingCreateInput> & {
  accountId?: string;
  barcode?: string | null;
};

export const GET = async (req: NextRequest) => {
  const auth = getAuthPayload(req);
  if ("error" in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const meterId = req.nextUrl.searchParams.get("meterId") ?? undefined;
  const result = await MobileService.getReadingContext(
    auth.payload.accountId,
    auth.payload.role,
    meterId
  );
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

  const body = (await req.json()) as MobileReadingCreatePayload;
  if (body.accountId && body.accountId !== auth.payload.accountId) {
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

  const result = await MobileService.createReading(auth.payload.accountId, input);

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
};
