import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedAccount } from 'src/services/authGuard';

export const POST = async (req: NextRequest) => {
  const guard = await requireVerifiedAccount(req);
  if (guard) return guard;

  // Placeholder: reading submission would be processed here.
  return NextResponse.json({ success: true, data: { message: 'Reading accepted (placeholder)' } });
};
