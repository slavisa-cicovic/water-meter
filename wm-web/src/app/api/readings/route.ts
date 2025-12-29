import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { ReadingsService } from 'src/services/readingsService';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const meterId = searchParams.get('meterId') || undefined;
  const accountId = searchParams.get('accountId') || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const result = await ReadingsService.list({
    meterId,
    accountId,
    from,
    to,
    page: page ? Number(page) : 0,
    pageSize: pageSize ? Number(pageSize) : 25,
  });

  return NextResponse.json(result.data);
};

export const POST = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const result = await ReadingsService.create(body);

  if (!result.success) {
    const status = result.error === 'VALIDATION_FAILED' ? 400 : result.error === 'ACCOUNT_NOT_FOUND' ? 404 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data, { status: 201 });
};
