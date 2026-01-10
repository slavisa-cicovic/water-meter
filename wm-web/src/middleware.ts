import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { NEXT_ALLOWED_DEV_ORIGINS, NODE_ENV } from "src/config-global";

const rawAllowedOrigins = NEXT_ALLOWED_DEV_ORIGINS;

const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const isOriginAllowed = (origin: string | null) => {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return allowedOrigins.some((entry) => {
      if (entry.includes("://")) {
        return entry === origin;
      }
      return entry === url.hostname;
    });
  } catch {
    return false;
  }
};

const buildCorsHeaders = (origin: string | null) => {
  const headers = new Headers();
  if (NODE_ENV !== "production") {
    if (allowedOrigins.length === 0) {
      headers.set("Access-Control-Allow-Origin", "*");
    } else if (isOriginAllowed(origin)) {
      headers.set("Access-Control-Allow-Origin", origin as string);
    }
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return headers;
};

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = buildCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
