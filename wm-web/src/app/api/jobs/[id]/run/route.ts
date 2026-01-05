import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { runJobNow } from 'src/services/job-scheduler';
import { BillingService } from 'src/services/billingService';

type Params = {
  params: Promise<{ id: string }>;
};

export const POST = withPermission(
  PERMISSIONS.JOBS_RUN,
  async (req: NextRequest, { params }: Params, guard) => {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (body?.dryRun) {
    const preview = await BillingService.previewMonthlyOverrides();
    return NextResponse.json(preview.data);
  }

  const result = await runJobNow(id, {
    initiatorId: guard.payload.accountId,
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
  }
);
