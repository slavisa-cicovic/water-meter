import path from "path";
import fs from "fs/promises";
import { UPLOADS_DIR } from "src/config-global";

const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export const getUploadsDir = () => UPLOADS_DIR || DEFAULT_UPLOADS_DIR;

export const ensureUploadsDir = async () => {
  const uploadsDir = getUploadsDir();
  await fs.mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
};
