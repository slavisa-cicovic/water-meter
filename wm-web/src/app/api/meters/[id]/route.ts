import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { MetersService } from 'src/services/metersService';

type Params = {
  params: { id: string };
};

export const GET = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const result = await MetersService.findById(params.id);
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
  const result = await MetersService.update({ ...body, id: params.id });

  if (!result.success) {
    const status =
      result.error === 'VALIDATION_FAILED' ? 400 : result.error === 'NOT_FOUND' ? 404 : result.error === 'METER_EXISTS' ? 409 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
};

export const DELETE = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const result = await MetersService.delete(params.id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'VALIDATION_FAILED' ? 400 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json({ success: true });
};

