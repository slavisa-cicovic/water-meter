import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { JobsService } from 'src/services/jobsService';

type Params = {
  params: Promise<{ id: string }>;
};

export const GET = withPermission(
  PERMISSIONS.JOBS_RUNS_LIST,
  async (req: NextRequest, { params }: Params) => {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get('limit');
  const { id } = await params;

  const result = await JobsService.listRuns(id, limit ? Number(limit) : 10);
  if (!result.success) {
    const status = result.error === 'NOT_FOUND' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json(result.data);
  }
);
