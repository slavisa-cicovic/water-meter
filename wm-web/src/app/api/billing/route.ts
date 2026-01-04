import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { BillingService } from 'src/services/billingService';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') || undefined;
  const search = searchParams.get('search') || undefined;
  const createdStart = searchParams.get('createdStart') || undefined;
  const createdEnd = searchParams.get('createdEnd') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const reviewFlags = searchParams.get('reviewFlags') || undefined;
  const orderBy = searchParams.get('orderBy') || undefined;
  const order = (searchParams.get('order') || undefined) as any;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const mappedReviewFlags = reviewFlags
    ? reviewFlags
        .split(',')
        .filter(Boolean)
        .map((flag) => {
          if (flag === 'invalid_reading') return 'non_positive_consumption';
          if (flag === 'no_reading') return 'no_reading_current_month';
          if (flag === 'no_household_size') return 'invalid_household_size';
          return flag;
        })
    : undefined;

  const result = await BillingService.listInvoices({
    accountId,
    search,
    createdStart,
    createdEnd,
    status,
    reviewFlags: mappedReviewFlags,
    orderBy,
    order,
    page: page ? Number(page) : 0,
    pageSize: pageSize ? Number(pageSize) : 25,
  });

  return NextResponse.json(result.data);
};

export const POST = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const result = await BillingService.generateForPeriod(body);

  if (!result.success) {
    const status = result.error === 'VALIDATION_FAILED' || result.error === 'INVALID_PERIOD' ? 400 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data, { status: 201 });
};

export const PATCH = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  if (!body?.ids || !Array.isArray(body.ids)) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  if (body.status !== 'confirmed') {
    return NextResponse.json({ success: false, error: 'UNSUPPORTED_STATUS' }, { status: 400 });
  }

  const result = await BillingService.confirmInvoices(body.ids);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  const data = (result as { data: { updated: number } }).data;
  return NextResponse.json({ success: true, data });
};
