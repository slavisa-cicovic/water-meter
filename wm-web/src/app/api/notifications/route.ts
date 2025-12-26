import { NextRequest, NextResponse } from 'next/server';
import { requireAccountsAccess } from 'src/services/authGuardAccounts';
import { NotificationService } from 'src/services/notificationService';

export const GET = async (req: NextRequest) => {
  const guard = requireAccountsAccess(req);
  if (!guard.ok) return guard.response;

  const result = await NotificationService.getSummary();

  return NextResponse.json(result.data);
};
