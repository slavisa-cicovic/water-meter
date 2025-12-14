import jwt from 'jsonwebtoken';
import { AccountRole, AccountTokenPayload, VerificationStatus } from 'src/types/accounts';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

export const TokenService = {
  issueAccountToken(account: { id: string; role: AccountRole; verificationStatus: VerificationStatus }) {
    const payload: AccountTokenPayload = {
      accountId: account.id,
      role: account.role,
      verificationStatus: account.verificationStatus,
      issuedAt: new Date().toISOString(),
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  parseAccountToken(token: string): AccountTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AccountTokenPayload;
    } catch (error) {
      return null;
    }
  },
};
