import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginPost } from 'src/app/api/auth/login/route';
import { GET as meGet } from 'src/app/api/auth/me/route';
import { AuthService } from 'src/services/authService';
import { TokenService } from 'src/services/tokenService';
import { AccountRepository } from 'src/repositories/accountRepository';
import { NextResponse } from 'next/server';

describe('API /auth/login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when credentials are missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await loginPost(req);
    expect(res.status).toBe(400);
  });

  it('delegates to AuthService and returns its response', async () => {
    const mockResponse = NextResponse.json({ success: true, data: { accessToken: 't', user: { id: 'u' } } }, { status: 200 });
    vi.spyOn(AuthService, 'login').mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'admin@example.com', password: 'password123' }),
    });

    const res = await loginPost(req);
    expect(AuthService.login).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});

describe('API /auth/me', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/me', { method: 'GET' });
    const res = await meGet(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue(null);
    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer invalid' },
    });
    const res = await meGet(req as any);
    expect(res.status).toBe(401);
  });

  it('returns user for valid token', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'acc-1',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    });
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({
      id: 'acc-1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'admin',
      verificationStatus: 'verified',
    } as any);

    const req = new NextRequest('http://localhost/api/auth/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await meGet(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user.email).toBe('admin@example.com');
  });
});
