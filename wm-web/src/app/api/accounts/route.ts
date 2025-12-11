import { NextResponse } from 'next/server';
import { AccountsService } from 'src/services/accountsService';

export const GET = async () =>
  NextResponse.json({
    success: true,
    data: await AccountsService.list(),
  });
