import { NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';

type Params = {
  params: { id: string };
};

export const GET = async (_req: Request, { params }: Params) => {
  const account = await AccountsService.findById(params.id);

  if (!account) {
    return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: account });
};
