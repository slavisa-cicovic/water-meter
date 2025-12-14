import jwt from 'jsonwebtoken';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { isValidToken } from 'src/auth/context/jwt/utils';
import { TokenService } from 'src/services/tokenService';

const SECRET = 'test-secret';

describe('token utils', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
    process.env.JWT_EXPIRES_IN = '1h';
  });

  it('valid token should pass isValidToken', () => {
    const token = TokenService.issueAccountToken({
      id: 'user1',
      role: 'admin',
      verificationStatus: 'verified',
    });
    expect(isValidToken(token)).toBe(true);
  });

  it('expired token should fail isValidToken', async () => {
    const token = jwt.sign({ sub: 'x' }, SECRET, { expiresIn: '1s' });
    await new Promise((r) => setTimeout(r, 1500));
    expect(isValidToken(token)).toBe(false);
  });

  it('malformed token should fail isValidToken', () => {
    expect(isValidToken('not-a-token')).toBe(false);
  });
});
