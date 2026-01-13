import { NextRequest, NextResponse } from 'next/server';
import prisma from 'src/utils/prisma';
import { AuthorizationService } from 'src/services/authorizationService';
import { TokenService } from 'src/services/tokenService';
import { VerificationStatus } from 'src/types/accounts';

export const POST = async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = TokenService.parseAccountToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 });
  }

  const account = await prisma.account.findUnique({
    where: { id: payload.accountId },
  });

  if (!account) {
    return NextResponse.json({ error: 'ACCOUNT_NOT_FOUND' }, { status: 404 });
  }

  if (account.verificationStatus !== 'verified') {
    return NextResponse.json({ error: 'ACCOUNT_NOT_VERIFIED' }, { status: 403 });
  }

  const permissions = await AuthorizationService.resolveAccountPermissions(account.id);
  const roles = await AuthorizationService.getRoleSlugsForAccount(account.id);
  const primaryRole = roles[0] ?? 'unknown';

  return NextResponse.json({
    accessToken: TokenService.issueAccountToken({
      id: account.id,
      role: primaryRole,
      roles,
      verificationStatus: account.verificationStatus as VerificationStatus,
      permissionsVersion: account.permissionsVersion,
    }),
    user: {
      id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      address: account.address,
      locale: account.locale ?? 'en',
      role: primaryRole,
      roles,
      verificationStatus: account.verificationStatus,
      permissions,
      permissionsVersion: account.permissionsVersion,
    },
  });
};
