import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as readingsGet, POST as readingsPost } from 'src/app/api/readings/route';
import { GET as readingGet, PUT as readingPut } from 'src/app/api/readings/[id]/route';
import { ReadingsService } from 'src/services/readingsService';
import { TokenService } from 'src/services/tokenService';

describe('API /readings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization header', async () => {
    const req = new NextRequest('http://localhost/api/readings', { method: 'GET' });
    const res = await readingsGet(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 for consumer role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'acc',
      role: 'consumer',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);

    const req = new NextRequest('http://localhost/api/readings', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await readingsGet(req as any);
    expect(res.status).toBe(403);
  });

  it('GET passes filters to service', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
    vi.spyOn(ReadingsService, 'list').mockResolvedValue({ success: true, data: { readings: [], total: 0 } } as any);

    const req = new NextRequest('http://localhost/api/readings?meterId=m1&accountId=a1&from=2024-01-01&to=2024-02-01', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await readingsGet(req as any);
    expect(res.status).toBe(200);
    expect(ReadingsService.list).toHaveBeenCalledWith(
      expect.objectContaining({
        meterId: 'm1',
        accountId: 'a1',
        from: '2024-01-01',
        to: '2024-02-01',
      })
    );
  });

  it('POST returns 201 on success', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
    vi.spyOn(ReadingsService, 'create').mockResolvedValue({ success: true, data: { reading: { id: 'r1' } } } as any);

    const req = new NextRequest('http://localhost/api/readings', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    } as any);
    (req as any).json = async () => ({
      meterId: 'm1',
      readerAccountId: 'c1',
      readAt: new Date().toISOString(),
      method: 'manual',
      value: 100,
    });

    const res = await readingsPost(req as any);
    expect(res.status).toBe(201);
  });
});

describe('API /readings/[id]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
  });

  it('GET returns 404 on NOT_FOUND', async () => {
    vi.spyOn(ReadingsService, 'findById').mockResolvedValue({ success: false, error: 'NOT_FOUND' } as any);

    const req = new NextRequest('http://localhost/api/readings/r1', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await readingGet(req as any, { params: { id: 'r1' } });
    expect(res.status).toBe(404);
  });

  it('PUT returns 200 on success', async () => {
    vi.spyOn(ReadingsService, 'update').mockResolvedValue({ success: true, data: { reading: { id: 'r1' } } } as any);

    const req = new NextRequest('http://localhost/api/readings/r1', {
      method: 'PUT',
      headers: { Authorization: 'Bearer token' },
    } as any);
    (req as any).json = async () => ({
      value: 120,
      editorAccountId: 's1',
      editorRole: 'staff_backoffice',
      editReason: 'Correction',
    });

    const res = await readingPut(req as any, { params: { id: 'r1' } });
    expect(res.status).toBe(200);
  });
});

