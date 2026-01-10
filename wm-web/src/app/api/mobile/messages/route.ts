import { NextRequest, NextResponse } from 'next/server';
import { PERMISSIONS } from 'src/constants/permissions';
import { withPermission } from 'src/services/permissionGuard';
import { MessageService } from 'src/services/messageService';

export const GET = withPermission(
  PERMISSIONS.MOBILE_MESSAGES_READ,
  async (_req: NextRequest, _ctx, guard) => {
    const result = await MessageService.getMobileThread(guard.payload.accountId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: result.data });
  }
);

export const POST = withPermission(
  PERMISSIONS.MOBILE_MESSAGES_CREATE,
  async (req: NextRequest, _ctx, guard) => {
    const payload = await req.json().catch(() => ({}));
    const roles = guard.payload.roles ?? [];
    const primaryRole = guard.payload.role;
    const allowAi = roles.includes('consumer') || roles.includes('staff_field') || primaryRole === 'consumer' || primaryRole === 'staff_field';
    const result = await MessageService.createMobileMessage(guard.payload.accountId, payload?.body, { allowAi });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data });
  }
);
