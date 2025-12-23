import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as metersGet, POST as metersPost } from 'src/app/api/meters/route';
import { GET as meterGet, PUT as meterPut, DELETE as meterDelete } from 'src/app/api/meters/[id]/route';
import { POST as linkPost, DELETE as linkDelete } from 'src/app/api/meters/[id]/consumers/route';
import { MetersService } from 'src/services/metersService';
import { TokenService } from 'src/services/tokenService';

describe('API /meters auth guard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization header', async () => {
    const req = new NextRequest('http://localhost/api/meters', { method: 'GET' });
    const res = await metersGet(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 for consumer role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'acc',
      role: 'consumer',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);

    const req = new NextRequest('http://localhost/api/meters', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await metersGet(req as any);
    expect(res.status).toBe(403);
  });
});

describe('API /meters routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
  });

  it('GET passes query params to MetersService.list', async () => {
    vi.spyOn(MetersService, 'list').mockResolvedValue({ success: true, data: { meters: [], total: 0 } } as any);

    const req = new NextRequest('http://localhost/api/meters?search=sn&status=active&groupCode=01&page=1&pageSize=10', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await metersGet(req as any);
    expect(res.status).toBe(200);
    expect(MetersService.list).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'sn', status: 'active', groupCode: '01', page: 1, pageSize: 10 })
    );
  });

  it('POST returns 201 on success', async () => {
    vi.spyOn(MetersService, 'create').mockResolvedValue({ success: true, data: { meter: { id: 'm1' } } } as any);

    const req = new NextRequest('http://localhost/api/meters', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
      body: JSON.stringify({ serialNumber: 'SN-1', address: 'Addr', type: 'automatic' }),
    } as any);

    // NextRequest in tests may not parse body unless json() is mocked
    (req as any).json = async () => ({ serialNumber: 'SN-1', address: 'Addr', type: 'automatic' });

    const res = await metersPost(req as any);
    expect(res.status).toBe(201);
  });

  it('GET /meters/[id] returns 404 on NOT_FOUND', async () => {
    vi.spyOn(MetersService, 'findById').mockResolvedValue({ success: false, error: 'NOT_FOUND' } as any);

    const req = new NextRequest('http://localhost/api/meters/m1', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await meterGet(req as any, { params: { id: 'm1' } });
    expect(res.status).toBe(404);
  });

  it('DELETE /meters/[id] returns 200 on success (soft delete)', async () => {
    vi.spyOn(MetersService, 'delete').mockResolvedValue({ success: true } as any);

    const req = new NextRequest('http://localhost/api/meters/m1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await meterDelete(req as any, { params: { id: 'm1' } });
    expect(res.status).toBe(200);
  });

  it('POST /meters/[id]/consumers returns 403 on CONSUMER_ONLY', async () => {
    vi.spyOn(MetersService, 'addConsumerLink').mockResolvedValue({ success: false, error: 'CONSUMER_ONLY' } as any);

    const req = new NextRequest('http://localhost/api/meters/m1/consumers', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    } as any);
    (req as any).json = async () => ({ accountId: 'a1' });

    const res = await linkPost(req as any, { params: { id: 'm1' } });
    expect(res.status).toBe(403);
  });

  it('DELETE /meters/[id]/consumers returns 200 on success', async () => {
    vi.spyOn(MetersService, 'removeConsumerLink').mockResolvedValue({ success: true } as any);

    const req = new NextRequest('http://localhost/api/meters/m1/consumers?accountId=a1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await linkDelete(req as any, { params: { id: 'm1' } });
    expect(res.status).toBe(200);
  });
});
