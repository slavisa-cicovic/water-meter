import { NextRequest } from "next/server";
import { AuthService } from "src/services/authService";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { identifier, password } = body || {};

  if (!identifier || !password) {
    return new Response(
      JSON.stringify({ success: false, error: "MISSING_CREDENTIALS" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return AuthService.login({ identifier, password });
};
