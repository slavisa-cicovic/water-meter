import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { JobsService, validateJobInput } from 'src/services/jobsService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  if (guard.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await params;
  const result = await JobsService.findById(id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json(result.data);
};

export const PUT = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  if (guard.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const validation = validateJobInput({ ...body, id });
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED', details: validation.errors }, { status: 400 });
  }

  const result = await JobsService.update({ ...body, id });
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json(result.data);
};
