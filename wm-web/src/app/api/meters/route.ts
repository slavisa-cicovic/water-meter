import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { MetersService } from 'src/services/metersService';

export const GET = withPermission(PERMISSIONS.METERS_LIST, async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const groupCode = searchParams.get('groupCode') || undefined;
  const type = (searchParams.get('type') || undefined) as any;
  const review = (searchParams.get('review') || undefined) as any;
  const consumerAccountId = searchParams.get('consumerAccountId') || undefined;
  const orderBy = (searchParams.get('orderBy') || undefined) as
    | 'serialNumber'
    | 'groupCode'
    | 'address'
    | 'type'
    | 'status'
    | 'createdAt'
    | undefined;
  const order = (searchParams.get('order') || undefined) as 'asc' | 'desc' | undefined;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const result = await MetersService.list({
    search,
    status,
    groupCode,
    type,
    review,
    consumerAccountId,
    orderBy,
    order,
    page: page ? Number(page) : 0,
    pageSize: pageSize ? Number(pageSize) : 25,
  });

  return NextResponse.json(result.data);
});

export const POST = withPermission(PERMISSIONS.METERS_CREATE, async (req: NextRequest) => {
  const body = await req.json();
  const result = await MetersService.create(body);

  if (!result.success) {
    const status = result.error === 'VALIDATION_FAILED' ? 400 : result.error === 'METER_EXISTS' ? 409 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data, { status: 201 });
});
