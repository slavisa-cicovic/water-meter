import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "src/services/permissionGuard";
import { PERMISSIONS } from "src/constants/permissions";
import { AccountRepository } from "src/repositories/accountRepository";

export const PUT = withPermission(PERMISSIONS.MESSAGES_REPLY, async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const accountId = body?.accountId;
  const enabled = body?.enabled;

  if (!accountId || typeof enabled !== "boolean") {
    return NextResponse.json({ success: false, error: "VALIDATION_FAILED" }, { status: 400 });
  }

  await AccountRepository.updateAiEnabled(accountId, enabled);
  return NextResponse.json({ success: true, data: { accountId, aiEnabled: enabled } });
});
