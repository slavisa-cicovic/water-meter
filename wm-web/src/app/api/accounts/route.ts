import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  const viewerRole = guard.role === 'admin' || guard.role === 'staff_backoffice' ? guard.role : undefined;

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
  const type = (searchParams.get('type') || undefined) as 'consumer' | 'staff' | undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const { accounts, total } = await AccountsService.list({
    search,
    orderBy,
    order,
    type: viewerRole === 'staff_backoffice' ? 'consumer' : type,
    status,
    page: page ? Number(page) : 0,
    pageSize: pageSize ? Number(pageSize) : 25,
    viewerRole,
  });

  return NextResponse.json({ accounts, total });
};
