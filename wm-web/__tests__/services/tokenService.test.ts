import { describe, expect, it, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

let TokenService: typeof import('src/services/tokenService').TokenService;

describe('TokenService', () => {
  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    vi.resetModules();
    TokenService = (await import('src/services/tokenService')).TokenService;
  });

  it('issues a signed token with expected payload', () => {
    const token = TokenService.issueAccountToken({
      id: 'acc-1',
      role: 'admin',
      verificationStatus: 'verified',
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    expect(decoded.accountId).toBe('acc-1');
    expect(decoded.role).toBe('admin');
    expect(decoded.verificationStatus).toBe('verified');
  });

  it('parses a valid token and returns payload', () => {
    const token = TokenService.issueAccountToken({
      id: 'acc-2',
      role: 'staff_backoffice',
      verificationStatus: 'pending',
    });

    const payload = TokenService.parseAccountToken(token)!;
    expect(payload.accountId).toBe('acc-2');
    expect(payload.role).toBe('staff_backoffice');
  });

  it('returns null for invalid token', () => {
    const payload = TokenService.parseAccountToken('invalid.token');
    expect(payload).toBeNull();
  });
});
