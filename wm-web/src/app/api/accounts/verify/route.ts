import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

export const POST = withPermission(PERMISSIONS.ACCOUNTS_VERIFY, async (req: NextRequest, _ctx, guard) => {
  const body = await req.json();
  const result = await AccountsService.verify(body, { viewerAccountId: guard.payload.accountId });

  if (!result.success) {
    const conflictErrors = ['NO_STATUS_CHANGE', 'INVALID_TRANSITION'];
    const status =
      result.error === 'NOT_FOUND' ? 404 : conflictErrors.includes(result.error || '') ? 409 : 400;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
});
