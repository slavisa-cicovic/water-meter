import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as billingGet, POST as billingPost } from 'src/app/api/billing/route';
import { GET as tariffsGet, POST as tariffsPost, PUT as tariffsPut } from 'src/app/api/billing/tariffs/route';
import { BillingService } from 'src/services/billingService';
import { TokenService } from 'src/services/tokenService';

describe('API /billing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 without Authorization header', async () => {
    const req = new NextRequest('http://localhost/api/billing', { method: 'GET' });
    const res = await billingGet(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 403 for consumer role', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'acc',
      role: 'consumer',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);

    const req = new NextRequest('http://localhost/api/billing', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await billingGet(req as any);
    expect(res.status).toBe(403);
  });

  it('POST returns 201 on success', async () => {
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
    vi.spyOn(BillingService, 'generateForPeriod').mockResolvedValue({ success: true, data: { invoices: [], skipped: [] } } as any);

    const req = new NextRequest('http://localhost/api/billing', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    } as any);
    (req as any).json = async () => ({
      accountId: 'seed',
      periodStart: '2024-01-01',
      periodEnd: '2024-02-01',
      vatRate: 0.19,
    });

    const res = await billingPost(req as any);
    expect(res.status).toBe(201);
  });
});

describe('API /billing/tariffs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(TokenService, 'parseAccountToken').mockReturnValue({
      accountId: 'admin',
      role: 'admin',
      verificationStatus: 'verified',
      issuedAt: new Date().toISOString(),
    } as any);
  });

  it('GET returns tariffs list', async () => {
    vi.spyOn(BillingService, 'listTariffs').mockResolvedValue({ success: true, data: { tariffs: [] } } as any);

    const req = new NextRequest('http://localhost/api/billing/tariffs', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
    });

    const res = await tariffsGet(req as any);
    expect(res.status).toBe(200);
  });

  it('POST returns 201 on success', async () => {
    vi.spyOn(BillingService, 'createTariff').mockResolvedValue({ success: true, data: { tariff: { id: 't1' } } } as any);

    const req = new NextRequest('http://localhost/api/billing/tariffs', {
      method: 'POST',
      headers: { Authorization: 'Bearer token' },
    } as any);
    (req as any).json = async () => ({
      name: 'Default',
      basePrice: 1,
      greenLimit: 15,
      blueLimit: 30,
      blueMultiplier: 1.2,
      redMultiplier: 2,
      validFrom: '2024-01-01',
    });

    const res = await tariffsPost(req as any);
    expect(res.status).toBe(201);
  });

  it('PUT returns 200 on success', async () => {
    vi.spyOn(BillingService, 'updateTariff').mockResolvedValue({ success: true, data: { tariff: { id: 't1' } } } as any);

    const req = new NextRequest('http://localhost/api/billing/tariffs', {
      method: 'PUT',
      headers: { Authorization: 'Bearer token' },
    } as any);
    (req as any).json = async () => ({
      id: 't1',
      name: 'Updated',
    });

    const res = await tariffsPut(req as any);
    expect(res.status).toBe(200);
  });
});

