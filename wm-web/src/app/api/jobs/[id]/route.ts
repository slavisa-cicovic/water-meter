import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { JobsService, validateJobInput } from 'src/services/jobsService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.JOBS_READ,
  async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const result = await JobsService.findById(id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json(result.data);
  }
);

export const PUT = withPermission(
  PERMISSIONS.JOBS_UPDATE,
  async (req: NextRequest, { params }: Params) => {
  const { id } = await params;
  const body = await req.json();
  const validation = validateJobInput({ ...body, id });
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED', details: validation.errors }, { status: 400 });
  }

  const result = await JobsService.update({ ...body, id });
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json(result.data);
  }
);
