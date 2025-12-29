import { NextRequest, NextResponse } from "next/server";
import { MobileService } from "src/services/mobileService";
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

type MobileReadingCreatePayload = Partial<ReadingCreateInput> & { accountId?: string };

export const GET = async (req: NextRequest) => {
  const auth = getAuthPayload(req);
  if ("error" in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const result = await MobileService.getReadingContext(auth.payload.accountId);
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

  const input: Omit<ReadingCreateInput, "readerAccountId"> = {
    meterId: body.meterId ?? "",
    readAt: body.readAt ?? new Date().toISOString(),
    method: body.method as ReadingCreateInput["method"],
    value: body.value as number,
    originalValue: body.originalValue,
    imageFilename: body.imageFilename ?? null,
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

  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
};
