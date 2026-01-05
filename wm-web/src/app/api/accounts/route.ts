import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';

export const GET = withPermission(PERMISSIONS.ACCOUNTS_LIST, async (req: NextRequest, _ctx, guard) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const orderBy = (searchParams.get('orderBy') || undefined) as
    | 'createdAt'
    | 'verificationStatus'
    | 'email'
    | 'name'
    | 'type'
    | undefined;
  const order = (searchParams.get('order') || undefined) as 'asc' | 'desc' | undefined;
  const type = (searchParams.get('type') || undefined) as
    | 'consumer'
    | 'staff'
    | 'admin'
    | 'staff_backoffice'
    | 'staff_field'
    | undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const { accounts, total } = await AccountsService.list({
    search,
    orderBy,
    order,
    type,
    status,
    page: page ? Number(page) : 0,
    pageSize: pageSize ? Number(pageSize) : 25,
    viewerAccountId: guard.payload.accountId,
  });

  return NextResponse.json({ accounts, total });
});
