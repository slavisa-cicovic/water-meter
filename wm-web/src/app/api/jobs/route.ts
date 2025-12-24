import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { JobsService, validateJobInput } from 'src/services/jobsService';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  if (guard.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const result = await JobsService.list();
  return NextResponse.json(result.data);
};

export const POST = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  if (guard.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const body = await req.json();
  const validation = validateJobInput(body);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED', details: validation.errors }, { status: 400 });
  }

  const result = await JobsService.create(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error, details: (result as any).details },
      { status: 400 }
    );
  }

  return NextResponse.json(result.data);
};
