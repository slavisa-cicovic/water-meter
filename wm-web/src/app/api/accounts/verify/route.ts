import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const result = await AccountsService.verify(body);

  if (!result.success) {
    const conflictErrors = ['NO_STATUS_CHANGE', 'INVALID_TRANSITION'];
    const status =
      result.error === 'NOT_FOUND' ? 404 : conflictErrors.includes(result.error || '') ? 409 : 400;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
