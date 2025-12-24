import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { runJobNow } from 'src/services/job-scheduler';

type Params = {
  params: Promise<{ id: string }>;
};

export const POST = async (req: NextRequest, { params }: Params) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;
  if (guard.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
  }

  const { id } = await params;
  const result = await runJobNow(id);

  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true });
};
