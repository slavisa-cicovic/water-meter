import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { runJobNow } from 'src/services/job-scheduler';
import { BillingService } from 'src/services/billingService';
import { TokenService } from 'src/services/tokenService';

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
  const body = await req.json().catch(() => ({}));

  if (body?.dryRun) {
    const preview = await BillingService.previewMonthlyOverrides();
    return NextResponse.json(preview.data);
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const payload = token ? TokenService.parseAccountToken(token) : null;

  const result = await runJobNow(id, {
    initiatorId: payload?.accountId,
    payload: {
      mode: 'manual',
      overrideIssued: Boolean(body?.overrideIssued),
      overridePaid: Boolean(body?.overridePaid),
    },
  });

  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true });
};
