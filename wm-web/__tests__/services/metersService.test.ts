import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetersService } from 'src/services/metersService';
import { MeterRepository } from 'src/repositories/meterRepository';
import { AccountRepository } from 'src/repositories/accountRepository';

describe('MetersService validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('allows groupCode null and rejects invalid formats', async () => {
    vi.spyOn(MeterRepository, 'create').mockResolvedValue({
      id: 'm1',
      serialNumber: 'SN-1',
      groupCode: null,
      address: 'Addr',
      status: 'active',
      installedAt: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const ok = await MetersService.create({ serialNumber: 'SN-1', address: 'Addr', groupCode: null });
    expect(ok.success).toBe(true);

    const bad = await MetersService.create({ serialNumber: 'SN-2', address: 'Addr', groupCode: '1' as any });
    expect(bad.success).toBe(false);
    expect((bad as any).error).toBe('VALIDATION_FAILED');
  });

  it('accepts groupCode 01..99 and rejects 00 and 100', async () => {
    vi.spyOn(MeterRepository, 'create').mockResolvedValue({
      id: 'm2',
      serialNumber: 'SN-OK',
      groupCode: '01',
      address: 'Addr',
      status: 'active',
      type: 'mechanical',
      installedAt: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const ok = await MetersService.create({ serialNumber: 'SN-OK', address: 'Addr', groupCode: '01' });
    expect(ok.success).toBe(true);

    const bad00 = await MetersService.create({ serialNumber: 'SN-00', address: 'Addr', groupCode: '00' as any });
    expect(bad00.success).toBe(false);

    const bad100 = await MetersService.create({ serialNumber: 'SN-100', address: 'Addr', groupCode: '100' as any });
    expect(bad100.success).toBe(false);
  });

  it('rejects invalid meter type', async () => {
    const result = await MetersService.create({
      serialNumber: 'SN-TYPE',
      address: 'Addr',
      type: 'smart' as any,
    });

    expect(result.success).toBe(false);
    expect((result as any).error).toBe('VALIDATION_FAILED');
  });
});

describe('MetersService consumer links', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects linking non-consumer accounts', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({ id: 'a1', role: 'staff_backoffice' } as any);

    const result = await MetersService.addConsumerLink({ meterId: 'm1', accountId: 'a1' });
    expect(result.success).toBe(false);
    expect((result as any).error).toBe('CONSUMER_ONLY');
  });

  it('is idempotent on duplicate links', async () => {
    vi.spyOn(AccountRepository, 'findById').mockResolvedValue({ id: 'c1', role: 'consumer' } as any);
    vi.spyOn(MeterRepository, 'addConsumerLink').mockRejectedValue({ code: 'P2002' } as any);

    const result = await MetersService.addConsumerLink({ meterId: 'm1', accountId: 'c1' });
    expect(result.success).toBe(true);
  });
});
