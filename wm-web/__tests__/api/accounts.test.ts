import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as accountsGet } from 'src/app/api/accounts/route';
import { GET as accountDetailGet } from 'src/app/api/accounts/[id]/route';
import { AccountsService } from 'src/services/accountsService';
import { TokenService } from 'src/services/tokenService';

describe('API /accounts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization header', async () => {
    const req = new NextRequest('http://localhost/api/accounts', { method: 'GET' });
    const res = await accountsGet(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 for consumer role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'acc',
      role: 'consumer',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);

    const req = new NextRequest('http://localhost/api/accounts', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await accountsGet(req as any);
    expect(res.status).toBe(403);
  });

  it('returns accounts for admin role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
    vi.spyOn(AccountsService, 'list').mockResolvedValue({ accounts: [], total: 0 });

    const req = new NextRequest('http://localhost/api/accounts?search=test', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await accountsGet(req as any);
    expect(res.status).toBe(200);
    expect(AccountsService.list).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test', viewerRole: 'admin' })
    );
  });
});

describe('API /accounts/[id]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 403 for consumer role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'acc',
      role: 'consumer',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);

    const req = new NextRequest('http://localhost/api/accounts/123', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await accountDetailGet(req as any, { params: { id: '123' } });
    expect(res.status).toBe(403);
  });

  it('returns account for admin role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
    vi.spyOn(AccountsService, 'findById').mockResolvedValue({
      id: '123',
      firstName: 'Test',
      lastName: 'User',
      email: 't@example.com',
      role: 'admin',
      verificationStatus: 'verified',
    } as any);

    const req = new NextRequest('http://localhost/api/accounts/123', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await accountDetailGet(req as any, { params: { id: '123' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.account.id).toBe('123');
  });
});
