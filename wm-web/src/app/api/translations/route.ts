import { NextRequest, NextResponse } from "next/server";
import { TranslationsService } from "src/services/translationsService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";
import type { TranslationUpdateInput } from "src/types/translations";

const buildEtag = (target: string, locale: string, updatedAt: string | null, count: number) => {
  const stamp = updatedAt ? new Date(updatedAt).getTime() : 0;
  return `W/"translations:${target}:${locale}:${stamp}:${count}"`;
};

export const GET = async (req: NextRequest) => {
  const locale = req.nextUrl.searchParams.get("locale") || "en";
  const target = req.nextUrl.searchParams.get("target") || "mobile";
  const bundle = await TranslationsService.getBundle(locale, target);
  if (!bundle) {
    return NextResponse.json({ success: false, error: "INVALID_LOCALE" }, { status: 400 });
  }

  const entriesCount = Object.keys(bundle.translations).length;
  const etag = buildEtag(bundle.target, bundle.locale, bundle.updatedAt, entriesCount);
  const ifNoneMatch = req.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  const ifModifiedSince = req.headers.get("if-modified-since");
  if (ifModifiedSince && bundle.updatedAt) {
    const since = new Date(ifModifiedSince);
    const lastUpdated = new Date(bundle.updatedAt);
    if (!Number.isNaN(since.valueOf()) && lastUpdated <= since) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }
  }

  const headers: Record<string, string> = {
    ETag: etag,
    "Cache-Control": "private, max-age=0, must-revalidate",
  };
  if (bundle.updatedAt) {
    headers["Last-Modified"] = new Date(bundle.updatedAt).toUTCString();
  }

  return NextResponse.json({ success: true, data: bundle }, { headers });
};

export const PUT = withPermission(PERMISSIONS.TRANSLATIONS_UPDATE, async (req: NextRequest, _ctx, guard) => {
  const body = (await req.json()) as TranslationUpdateInput;
  if (!body?.locale || !body?.target || !Array.isArray(body.updates)) {
    return NextResponse.json({ success: false, error: "VALIDATION_FAILED" }, { status: 400 });
  }

  const updates = body.updates.filter((entry) => entry && typeof entry.key === "string" && typeof entry.value === "string");
  if (updates.length !== body.updates.length) {
    return NextResponse.json({ success: false, error: "VALIDATION_FAILED" }, { status: 400 });
  }

  const bundle = await TranslationsService.update(body.locale, body.target, updates, guard.payload.accountId);
  if (!bundle) {
    return NextResponse.json({ success: false, error: "INVALID_LOCALE_OR_KEYS" }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: bundle });
});
