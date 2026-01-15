import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { BillingService } from 'src/services/billingService';
import { withPermission } from 'src/services/permissionGuard';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(PERMISSIONS.INVOICE_LINE_ITEMS_READ, async (_req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const result = await BillingService.findInvoiceLineItemById(id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }
  return NextResponse.json(result.data);
});

export const PUT = withPermission(PERMISSIONS.INVOICE_LINE_ITEMS_UPDATE, async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const body = await req.json();
  const result = await BillingService.updateInvoiceLineItem({ ...body, id });

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status: 400 });
  }

  return NextResponse.json(result.data);
});
