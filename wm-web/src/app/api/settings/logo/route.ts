import path from "path";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "src/services/permissionGuard";
import { PERMISSIONS } from "src/constants/permissions";
import { ensureUploadsDir } from "src/utils/uploads";

export const runtime = "nodejs";

const sanitizeBaseName = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");

export const POST = withPermission(PERMISSIONS.SETTINGS_UPDATE, async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "VALIDATION_FAILED", details: { file: ["Required"] } },
      { status: 400 }
    );
  }

  if (!file.type?.startsWith("image/")) {
    return NextResponse.json(
      { success: false, error: "VALIDATION_FAILED", details: { file: ["Must be an image"] } },
      { status: 400 }
    );
  }

  const originalName = file.name || "logo";
  const extension = path.extname(originalName);
  const baseName = sanitizeBaseName(path.basename(originalName, extension)) || "logo";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "");
  const random = Math.random().toString(36).slice(2, 8);
  const filename = `${baseName}_${timestamp}_${random}${extension}`;
  const uploadsDir = await ensureUploadsDir();

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({
    success: true,
    data: {
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    },
  });
});
