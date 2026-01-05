import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from 'src/config-global';
import { AccountRole, AccountTokenPayload, VerificationStatus } from 'src/types/accounts';

export const TokenService = {
  issueAccountToken(account: {
    id: string;
    role: AccountRole;
    verificationStatus: VerificationStatus;
    permissionsVersion: number;
  }) {
    const payload: AccountTokenPayload = {
      accountId: account.id,
      role: account.role,
      verificationStatus: account.verificationStatus,
      permissionsVersion: account.permissionsVersion,
      issuedAt: new Date().toISOString(),
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] });
  },

  parseAccountToken(token: string): AccountTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AccountTokenPayload;
    } catch (error) {
      return null;
    }
  },
};
