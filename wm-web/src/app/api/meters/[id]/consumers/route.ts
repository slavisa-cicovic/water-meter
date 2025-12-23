import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { MetersService } from 'src/services/metersService';

type Params = {
  params: Promise<{ id: string }>;
};

export const POST = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const accountId = body?.accountId as string | undefined;

  const { id } = await params;
  const result = await MetersService.addConsumerLink({ meterId: id, accountId: accountId || '' });
  if (!result.success) {
    const status =
      result.error === 'VALIDATION_FAILED'
        ? 400
        : result.error === 'ACCOUNT_NOT_FOUND' || result.error === 'NOT_FOUND'
        ? 404
        : result.error === 'CONSUMER_ONLY'
        ? 403
        : 500;

    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json({ success: true }, { status: 201 });
};

export const DELETE = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') || '';

  const { id } = await params;
  const result = await MetersService.removeConsumerLink({ meterId: id, accountId });
  if (!result.success) {
    const status = result.error === 'VALIDATION_FAILED' ? 400 : result.error === 'NOT_FOUND' ? 404 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json({ success: true });
};
