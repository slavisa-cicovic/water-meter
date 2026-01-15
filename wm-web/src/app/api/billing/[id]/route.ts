import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { BillingService } from 'src/services/billingService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.BILLING_READ,
  async (req: NextRequest, { params }: Params) => {
    const { id } = await params;
    const result = await BillingService.findInvoiceById(id);
    if (!result.success) {
      const status = result.error === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
    }

    const data = (result as { data: unknown }).data;
    return NextResponse.json({ success: true, data });
  }
);

export const PATCH = withPermission(
  PERMISSIONS.BILLING_REVIEW,
  async (req: NextRequest, { params }: Params, guard) => {
    const body = await req.json();
    if (!body?.previous || !body?.current || typeof body.reason !== 'string') {
      return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400 });
    }

    const { id } = await params;
    const result = await BillingService.reviewInvoiceReadings({
      invoiceId: id,
      previous: body.previous,
      current: body.current,
      reason: body.reason,
      editorAccountId: guard.payload.accountId,
      editorRole: guard.payload.role,
      householdSize: body.householdSize,
    });

    if (!result.success) {
      const status = result.error === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
    }

    const data = (result as { data: unknown }).data;
    return NextResponse.json({ success: true, data });
  }
);

export const PUT = withPermission(
  PERMISSIONS.BILLING_UPDATE,
  async (req: NextRequest, { params }: Params) => {
    const body = await req.json();
    if (!Array.isArray(body?.lineItemIds)) {
      return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400 });
    }

    const { id } = await params;
    const result = await BillingService.updateInvoiceLineItems({
      invoiceId: id,
      lineItemIds: body.lineItemIds,
    });

    if (!result.success) {
      const status = result.error === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
    }

    const data = (result as { data: unknown }).data;
    return NextResponse.json({ success: true, data });
  }
);
