import { NextRequest, NextResponse } from "next/server";
import { AccountsService } from "src/services/accountsService";
import { PERMISSIONS } from "src/constants/permissions";
import { withPermission } from "src/services/permissionGuard";

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.ACCOUNTS_READ,
  async (req: NextRequest, { params }: Params, guard) => {
    const { id } = await params;
    const result = await AccountsService.findByIdForViewer(id, guard.payload.accountId);

    if (!result.account) {
      const status = result.error === 'FORBIDDEN' ? 403 : 404;
      return NextResponse.json({ error: result.error ?? 'NOT_FOUND' }, { status });
    }

    return NextResponse.json({ account: result.account });
  }
);

export const PUT = withPermission(
  PERMISSIONS.ACCOUNTS_UPDATE,
  async (req: NextRequest, { params }: Params, guard) => {
    const { id } = await params;
    const body = await req.json();

    const result = await AccountsService.updateAccount(id, body, {
      viewerAccountId: guard.payload.accountId,
      viewerId: guard.payload.accountId,
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
  }
);
