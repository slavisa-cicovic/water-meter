import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";
import { ensureUploadsDir } from "src/utils/uploads";
import fs from "fs/promises";

export const runtime = "nodejs";

const sanitizeBaseName = (value: string) =>
  value.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");

export const POST = withPermission(
  PERMISSIONS.MOBILE_READINGS_CREATE,
  async (req: NextRequest) => {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "VALIDATION_FAILED", details: { file: ["Required"] } },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload";
    const extension = path.extname(originalName);
    const baseName = sanitizeBaseName(path.basename(originalName, extension)) || "upload";
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
  }
);
