import { AccountRole, AccountTokenPayload, VerificationStatus } from 'src/types/accounts';

const encode = (payload: object) => Buffer.from(JSON.stringify(payload)).toString('base64url');
const decode = (token: string) => JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));

export const TokenService = {
  issueAccountToken(account: { id: string; role: AccountRole; verificationStatus: VerificationStatus }) {
    const payload: AccountTokenPayload = {
      accountId: account.id,
      role: account.role,
      verificationStatus: account.verificationStatus,
      issuedAt: new Date().toISOString(),
    };
    return encode(payload);
  },

  parseAccountToken(token: string): AccountTokenPayload | null {
    try {
      return decode(token) as AccountTokenPayload;
    } catch (error) {
      return null;
    }
  },
};
