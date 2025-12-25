import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { BillingService } from 'src/services/billingService';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const result = await BillingService.listTariffs();
  return NextResponse.json(result.data);
};

export const POST = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const result = await BillingService.createTariff(body);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status: 400 });
  }

  return NextResponse.json(result.data, { status: 201 });
};

export const PUT = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const result = await BillingService.updateTariff(body);

  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
};

export const PATCH = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  if (!body?.ids || !Array.isArray(body.ids) || !body.action) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  if (!['delete', 'activate', 'deactivate'].includes(body.action)) {
    return NextResponse.json({ success: false, error: 'UNSUPPORTED_ACTION' }, { status: 400 });
  }

  const result = await BillingService.bulkUpdateTariffs(body.ids, body.action);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
};
