import { NextRequest } from "next/server";
import { AuthService } from "src/services/authService";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const { identifier } = body || {};

  if (!identifier) {
    return new Response(
      JSON.stringify({ success: false, error: "MISSING_IDENTIFIER" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return AuthService.forgotPassword(identifier);
};
