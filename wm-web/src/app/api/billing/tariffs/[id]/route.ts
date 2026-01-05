import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { BillingService } from 'src/services/billingService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.TARIFFS_READ,
  async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const result = await BillingService.findTariffById(id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
  }
);
