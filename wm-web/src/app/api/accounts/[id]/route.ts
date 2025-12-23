import { NextRequest, NextResponse } from "next/server";
import { AccountsService } from "src/services/accountsService";
import { requireAccountsAccess } from "src/services/authGuardAccounts";

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
