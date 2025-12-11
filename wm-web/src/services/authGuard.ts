import { NextRequest, NextResponse } from 'next/server';
import { AccountsService } from './accountsService';
import { TokenService } from './tokenService';

export const requireVerifiedAccount = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = TokenService.parseAccountToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'INVALID_TOKEN' }, { status: 401 });
  }

  return AccountsService.findById(payload.accountId).then((account) => {
    if (!account) {
      return NextResponse.json({ success: false, error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
    }

    if (account.verificationStatus !== 'verified') {
      return NextResponse.json({ success: false, error: 'NOT_VERIFIED' }, { status: 403 });
    }

    return null;
  });
};
