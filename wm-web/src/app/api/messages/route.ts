import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { MessageService } from 'src/services/messageService';

export const GET = withPermission(PERMISSIONS.MESSAGES_READ, async (req: NextRequest) => {
  const url = new URL(req.url);
  const accountId = url.searchParams.get('accountId');
  const limit = url.searchParams.get('limit');
  const before = url.searchParams.get('before');
  const parsedLimit = limit ? Number(limit) : undefined;
  const safeLimit = parsedLimit && !Number.isNaN(parsedLimit) ? parsedLimit : undefined;

  if (accountId) {
    const result = await MessageService.getWebThread(accountId, {
      limit: safeLimit,
      before,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result.data);
  }

  const result = await MessageService.listWebThreads();
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
});

export const POST = withPermission(PERMISSIONS.MESSAGES_REPLY, async (req: NextRequest, _ctx, guard) => {
  const payload = await req.json().catch(() => ({}));
  const accountId = payload?.accountId;
  if (!accountId) {
    return NextResponse.json({ error: 'VALIDATION_FAILED' }, { status: 400 });
  }

  const result = await MessageService.createWebMessage(accountId, guard.payload.accountId, payload?.body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result.data);
});
