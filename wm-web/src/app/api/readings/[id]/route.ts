import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { ReadingsService } from 'src/services/readingsService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.READINGS_READ,
  async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const result = await ReadingsService.findById(id);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  const data = (result as { data: { reading: unknown } }).data;
  return NextResponse.json({ success: true, data });
  }
);

export const PUT = withPermission(
  PERMISSIONS.READINGS_UPDATE,
  async (req: NextRequest, { params }: Params) => {
  const body = await req.json();
  const { id } = await params;
  const result = await ReadingsService.update({ ...body, id });

  if (!result.success) {
    const status =
      result.error === 'VALIDATION_FAILED'
        ? 400
        : result.error === 'NOT_FOUND'
        ? 404
        : result.error === 'ACCOUNT_NOT_FOUND'
        ? 404
        : result.error === 'READER_FORBIDDEN' || result.error === 'EDITOR_FORBIDDEN'
        ? 403
        : 500;
    return NextResponse.json({ success: false, error: result.error, details: (result as any).details }, { status });
  }

  const data = (result as { data: { reading: unknown } }).data;
  return NextResponse.json({ success: true, data });
  }
);
