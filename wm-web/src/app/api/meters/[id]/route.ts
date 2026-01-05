import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { MetersService } from 'src/services/metersService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.METERS_READ,
  async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const result = await MetersService.findById(id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
  }
);

export const PUT = withPermission(
  PERMISSIONS.METERS_UPDATE,
  async (req: NextRequest, { params }: Params) => {
  const body = await req.json();
  const { id } = await params;
  const result = await MetersService.update({ ...body, id });

  if (!result.success) {
    const status =
      result.error === 'VALIDATION_FAILED' ? 400 : result.error === 'NOT_FOUND' ? 404 : result.error === 'METER_EXISTS' ? 409 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json(result.data);
  }
);

export const DELETE = withPermission(
  PERMISSIONS.METERS_DELETE,
  async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const result = await MetersService.delete(id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'VALIDATION_FAILED' ? 400 : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  return NextResponse.json({ success: true });
  }
);
