import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';
import { PERMISSIONS } from 'src/constants/permissions';
import { requirePermission } from 'src/services/authPermissionGuard';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const permissionSlug =
    body?.status === 'rejected' ? PERMISSIONS.ACCOUNTS_REJECT : PERMISSIONS.ACCOUNTS_VERIFY;
  const guard = await requirePermission(req, permissionSlug);
  if (!guard.ok) {
    return guard.response;
  }
  const result = await AccountsService.verify(
    {
      ...body,
      reviewerId: guard.payload.accountId,
    },
    { viewerAccountId: guard.payload.accountId, permissionSlug }
  );

  if (!result.success) {
    const conflictErrors = ['NO_STATUS_CHANGE', 'INVALID_TRANSITION'];
    const status =
      result.error === 'NOT_FOUND' ? 404 : conflictErrors.includes(result.error || '') ? 409 : 400;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
