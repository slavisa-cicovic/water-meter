import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { BillingService } from 'src/services/billingService';
import { withPermission } from 'src/services/permissionGuard';

export const GET = withPermission(PERMISSIONS.INVOICE_LINE_ITEMS_LIST, async () => {
  const result = await BillingService.listInvoiceLineItems();
  return NextResponse.json(result.data);
});

export const POST = withPermission(PERMISSIONS.INVOICE_LINE_ITEMS_CREATE, async (req: NextRequest) => {
  const body = await req.json();
  const result = await BillingService.createInvoiceLineItem(body);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status: 400 });
  }

  return NextResponse.json(result.data, { status: 201 });
});
