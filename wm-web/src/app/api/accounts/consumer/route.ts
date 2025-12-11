import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const result = await AccountsService.registerConsumer(body);

  if (!result.success) {
    const status = result.error === 'ACCOUNT_EXISTS' ? 409 : 400;
    return NextResponse.json({ success: false, error: result.error, details: result.details }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
};
