import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { requirePermission } from 'src/services/authPermissionGuard';
import { JobsService, validateJobInput } from 'src/services/jobsService';

export const GET = withPermission(PERMISSIONS.JOBS_LIST, async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const orderBy = (searchParams.get('orderBy') || undefined) as any;
  const order = (searchParams.get('order') || undefined) as any;
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  const result = await JobsService.list({
    search,
    status,
    orderBy,
    order,
    page: page ? Number(page) : 0,
    pageSize: pageSize ? Number(pageSize) : 25,
  });
  return NextResponse.json(result.data);
});

export const POST = withPermission(PERMISSIONS.JOBS_CREATE, async (req: NextRequest) => {
  const body = await req.json();
  const validation = validateJobInput(body);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED', details: validation.errors }, { status: 400 });
  }

  const result = await JobsService.create(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error, details: (result as any).details },
      { status: 400 }
    );
  }

  return NextResponse.json(result.data);
});

export const PATCH = async (req: NextRequest) => {
  const body = await req.json();
  if (!body?.ids || !Array.isArray(body.ids) || !body.action) {
    return NextResponse.json({ success: false, error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  if (!['delete', 'activate', 'deactivate'].includes(body.action)) {
    return NextResponse.json({ success: false, error: 'UNSUPPORTED_ACTION' }, { status: 400 });
  }

  const permissionSlug = body.action === 'delete' ? PERMISSIONS.JOBS_DELETE : PERMISSIONS.JOBS_BULK_UPDATE;
  const guard = await requirePermission(req, permissionSlug);
  if (!guard.ok) {
    return guard.response;
  }

  const result = await JobsService.bulkUpdate(body.ids, body.action);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
};
