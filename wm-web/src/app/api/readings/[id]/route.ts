import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { ReadingsService } from 'src/services/readingsService';

type Params = {
  params: { id: string };
};

export const GET = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const result = await ReadingsService.findById(params.id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
};

export const PUT = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const body = await req.json();
  const result = await ReadingsService.update({ ...body, id: params.id });

  if (!result.success) {
    const status =
      result.error === 'VALIDATION_FAILED'
        ? 400
        : result.error === 'NOT_FOUND'
        ? 404
        : result.error === 'ACCOUNT_NOT_FOUND'
        ? 404
        : result.error === 'READER_FORBIDDEN' || result.error === 'EDITOR_FORBIDDEN'
        ? 403
        : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
};

