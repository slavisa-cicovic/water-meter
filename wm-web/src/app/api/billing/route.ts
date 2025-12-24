import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { BillingService } from 'src/services/billingService';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') || undefined;
  const meterId = searchParams.get('meterId') || undefined;
  const createdStart = searchParams.get('createdStart') || undefined;
  const createdEnd = searchParams.get('createdEnd') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const review = searchParams.get('review') || undefined;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const result = await BillingService.listInvoices({
    accountId,
    meterId,
    createdStart,
    createdEnd,
    status,
    review,
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
