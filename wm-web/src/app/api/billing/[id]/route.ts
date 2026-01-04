import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { BillingService } from 'src/services/billingService';
import { TokenService } from 'src/services/tokenService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const result = await BillingService.findInvoiceById(id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  const data = (result as { data: unknown }).data;
  return NextResponse.json({ success: true, data });
};

export const PATCH = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const payload = token ? TokenService.parseAccountToken(token) : null;
  if (!payload) {
    return NextResponse.json({ success: false, error: 'INVALID_TOKEN' }, { status: 401 });
  }

  const body = await req.json();
  if (!body?.previous || !body?.current || typeof body.reason !== 'string') {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  const { id } = await params;
  const result = await BillingService.reviewInvoiceReadings({
    invoiceId: id,
    previous: body.previous,
    current: body.current,
    reason: body.reason,
    editorAccountId: payload.accountId,
    editorRole: payload.role as 'admin' | 'staff_backoffice',
    householdSize: body.householdSize,
  });

  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  const data = (result as { data: unknown }).data;
  return NextResponse.json({ success: true, data });
};
