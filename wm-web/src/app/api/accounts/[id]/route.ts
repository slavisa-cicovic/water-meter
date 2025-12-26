import { NextRequest, NextResponse } from "next/server";
import { AccountsService } from "src/services/accountsService";
import { requireAccountsAccess } from "src/services/authGuardAccounts";
import { TokenService } from "src/services/tokenService";

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  const viewerRole = guard.role as 'admin' | 'staff_backoffice';

  const { id } = await params;
  const account = await AccountsService.findById(id, viewerRole);

  if (!account) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ account });
};

export const PUT = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const body = await req.json();
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const payload = TokenService.parseAccountToken(token);

  const result = await AccountsService.updateAccount(id, body, {
    viewerRole: payload?.role as 'admin' | 'staff_backoffice' | undefined,
    viewerId: payload?.accountId,
  });

  if (!result.success) {
    const status =
      result.error === 'NOT_FOUND'
        ? 404
        : result.error === 'TARIFF_NOT_FOUND'
        ? 404
        : result.error === 'FORBIDDEN'
        ? 403
        : result.error === 'VALIDATION_FAILED' || result.error === 'INVALID_TARIFF_ASSIGNMENT'
        ? 400
        : 500;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ account: result.data?.account });
};
