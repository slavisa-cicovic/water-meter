import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from 'src/services/billingService';
import { BillingRepository } from 'src/repositories/billingRepository';
import { MeterRepository } from 'src/repositories/meterRepository';
import { ReadingRepository } from 'src/repositories/readingRepository';

describe('BillingService generateForPeriod', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates invoice per meter when single consumer', async () => {
    vi.spyOn(MeterRepository, 'listAll').mockResolvedValue([{ id: 'm1', groupCode: null }] as any);
    vi.spyOn(ReadingRepository, 'findLatestForMeterBefore')
      .mockResolvedValueOnce({ id: 'r2', value: 120, readAt: new Date('2024-02-01') } as any)
      .mockResolvedValueOnce({ id: 'r1', value: 100, readAt: new Date('2024-01-01') } as any);
    vi.spyOn(MeterRepository, 'listConsumersForMeter').mockResolvedValue([
      { accountId: 'a1', account: { consumerProfile: { householdSize: 2 } } },
    ] as any);
    vi.spyOn(BillingRepository, 'findApplicableTariff').mockResolvedValue({
      id: 't1',
      basePrice: 1,
      greenLimit: 15,
      blueLimit: 30,
      blueMultiplier: 1.2,
      redMultiplier: 2,
      validFrom: new Date('2024-01-01'),
    } as any);
    const createSpy = vi.spyOn(BillingRepository, 'createInvoice').mockResolvedValue({ id: 'i1' } as any);
    vi.spyOn(BillingRepository, 'addInvoiceLine').mockResolvedValue({} as any);
    vi.spyOn(BillingRepository, 'addReadingLink').mockResolvedValue({} as any);

    const result = await BillingService.generateForPeriod({
      accountId: 'seed',
      periodStart: '2024-01-01',
      periodEnd: '2024-02-01',
      vatRate: 0.19,
    } as any);

    expect(result.success).toBe(true);
    expect(createSpy).toHaveBeenCalled();
  });

  it('splits consumption by household size for shared meter', async () => {
    vi.spyOn(MeterRepository, 'listAll').mockResolvedValue([{ id: 'm1', groupCode: null }] as any);
    vi.spyOn(ReadingRepository, 'findLatestForMeterBefore')
      .mockResolvedValueOnce({ id: 'r2', value: 200, readAt: new Date('2024-02-01') } as any)
      .mockResolvedValueOnce({ id: 'r1', value: 100, readAt: new Date('2024-01-01') } as any);
    vi.spyOn(MeterRepository, 'listConsumersForMeter').mockResolvedValue([
      { accountId: 'a1', account: { consumerProfile: { householdSize: 2 } } },
      { accountId: 'a2', account: { consumerProfile: { householdSize: 1 } } },
    ] as any);
    vi.spyOn(BillingRepository, 'findApplicableTariff').mockResolvedValue({
      id: 't1',
      basePrice: 1,
      greenLimit: 15,
      blueLimit: 30,
      blueMultiplier: 1.2,
      redMultiplier: 2,
      validFrom: new Date('2024-01-01'),
    } as any);
    const createSpy = vi.spyOn(BillingRepository, 'createInvoice').mockResolvedValue({ id: 'i1' } as any);
    vi.spyOn(BillingRepository, 'addInvoiceLine').mockResolvedValue({} as any);
    vi.spyOn(BillingRepository, 'addReadingLink').mockResolvedValue({} as any);

    const result = await BillingService.generateForPeriod({
      accountId: 'seed',
      periodStart: '2024-01-01',
      periodEnd: '2024-02-01',
      vatRate: 0.19,
    } as any);

    expect(result.success).toBe(true);
    expect(createSpy).toHaveBeenCalledTimes(2);
  });
});

