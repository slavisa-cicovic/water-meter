import { BillingRepository } from 'src/repositories/billingRepository';
import { MeterRepository } from 'src/repositories/meterRepository';
import { ReadingRepository } from 'src/repositories/readingRepository';
import { InvoiceCreateInput, TariffCreateInput, TariffUpdateInput } from 'src/types/billings';
import { validateInvoiceCreate, validateTariffCreate, validateTariffUpdate } from 'src/validation/billings';

const toNumber = (value: any) => Number(value);
const toMoney = (value: number) => Number(value.toFixed(2));
const toQuantity = (value: number) => Number(value.toFixed(3));
const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const isCurrentMonth = (date: Date, reference: Date) => getMonthKey(date) === getMonthKey(reference);
const getMonthBounds = (reference: Date) => ({
  start: new Date(reference.getFullYear(), reference.getMonth(), 1),
  end: new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999),
});

const buildTariffSnapshot = (tariff: any) => ({
  id: tariff.id,
  name: tariff.name,
  basePrice: tariff.basePrice?.toString?.() ?? String(tariff.basePrice),
  greenLimit: tariff.greenLimit,
  blueLimit: tariff.blueLimit,
  blueMultiplier: tariff.blueMultiplier?.toString?.() ?? String(tariff.blueMultiplier),
  redMultiplier: tariff.redMultiplier?.toString?.() ?? String(tariff.redMultiplier),
  validFrom: tariff.validFrom?.toISOString?.() ?? tariff.validFrom,
  validTo: tariff.validTo?.toISOString?.() ?? tariff.validTo ?? null,
  groupCode: tariff.groupCode ?? null,
});

export const BillingService = {
  async listTariffs() {
    const tariffs = await BillingRepository.listTariffs();
    return { success: true, data: { tariffs } };
  },

  async createTariff(input: TariffCreateInput) {
    const validation = validateTariffCreate(input);
    if (!validation.valid) return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    const tariff = await BillingRepository.createTariff(input);
    return { success: true, data: { tariff } };
  },

  async updateTariff(input: TariffUpdateInput) {
    const validation = validateTariffUpdate(input);
    if (!validation.valid) return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    try {
      const tariff = await BillingRepository.updateTariff(input);
      return { success: true, data: { tariff } };
    } catch (error: any) {
      if (error.code === 'P2025') return { success: false, error: 'NOT_FOUND' };
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async listInvoices(params: any) {
    const { invoices, total } = await BillingRepository.listInvoices(params);
    return { success: true, data: { invoices, total } };
  },

  async findInvoiceById(id: string) {
    if (!id) return { success: false, error: 'VALIDATION_FAILED', details: { id: ['Required'] } };
    const invoice = await BillingRepository.findInvoiceById(id);
    if (!invoice) return { success: false, error: 'NOT_FOUND' };
    return { success: true, data: { invoice } };
  },

  async generateForPeriod(input: InvoiceCreateInput) {
    const validation = validateInvoiceCreate(input);
    if (!validation.valid) return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };

    const periodStart = new Date(input.periodStart);
    const periodEnd = new Date(input.periodEnd);
    if (periodStart >= periodEnd) {
      return { success: false, error: 'INVALID_PERIOD' };
    }

    const vatRate = input.vatRate ?? 0.19;
    const meters = await MeterRepository.listAll();

    const created: any[] = [];
    const skipped: Array<{ meterId: string; reason: string }> = [];

    for (const meter of meters) {
      const endReading = await ReadingRepository.findLatestForMeterBefore(meter.id, periodEnd);
      if (!endReading) {
        skipped.push({ meterId: meter.id, reason: 'NO_END_READING' });
        continue;
      }

      const beforeEnd = new Date(new Date(endReading.readAt).getTime() - 1);
      const startReading = await ReadingRepository.findLatestForMeterBefore(meter.id, beforeEnd);
      if (!startReading) {
        skipped.push({ meterId: meter.id, reason: 'NO_START_READING' });
        continue;
      }

      const consumptionTotal = endReading.value - startReading.value;
      if (consumptionTotal <= 0) {
        skipped.push({ meterId: meter.id, reason: 'NON_POSITIVE_CONSUMPTION' });
        continue;
      }

      const consumers = await MeterRepository.listConsumersForMeter(meter.id);
      if (!consumers.length) {
        skipped.push({ meterId: meter.id, reason: 'NO_CONSUMERS' });
        continue;
      }

      const tariff = await BillingRepository.findApplicableTariff({
        groupCode: meter.groupCode ?? null,
        periodStart: periodStart ?? periodEnd ?? new Date(),
        periodEnd: periodEnd ?? periodStart ?? new Date(),
      });
      if (!tariff) {
        skipped.push({ meterId: meter.id, reason: 'NO_TARIFF' });
        continue;
      }

      const unitPrice = toNumber(tariff.basePrice);
      const tariffSnapshot = buildTariffSnapshot(tariff);

      if (consumers.length === 1) {
        const accountId = consumers[0].accountId;
        const subtotal = toMoney(consumptionTotal * unitPrice);
        const vatAmount = toMoney(subtotal * vatRate);
        const totalAmount = toMoney(subtotal + vatAmount);

        const invoice = await BillingRepository.createInvoice({
          accountId,
          meterId: meter.id,
          periodStart,
          periodEnd,
          status: 'draft',
          consumption: consumptionTotal,
          unitPrice,
          subtotal,
          vatRate,
          vatAmount,
          totalAmount,
          tariffId: tariff.id,
          tariffSnapshot,
        });

        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'consumption',
          description: 'Water consumption',
          quantity: toQuantity(consumptionTotal),
          unitPrice,
          amount: subtotal,
        });
        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'vat',
          description: `VAT ${toMoney(vatRate * 100)}%`,
          amount: vatAmount,
        });
        await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: startReading.id, role: 'start' });
        await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: endReading.id, role: 'end' });

        created.push(invoice);
        continue;
      }

      const householdTotal = consumers.reduce((sum, c) => sum + (c.account.consumerProfile?.householdSize || 1), 0);

      for (const consumer of consumers) {
        const householdSize = consumer.account.consumerProfile?.householdSize || 1;
        const share = householdSize / householdTotal;
        const consumptionShare = toQuantity(consumptionTotal * share);
        const subtotal = toMoney(consumptionShare * unitPrice);
        const vatAmount = toMoney(subtotal * vatRate);
        const totalAmount = toMoney(subtotal + vatAmount);

        const invoice = await BillingRepository.createInvoice({
          accountId: consumer.accountId,
          meterId: meter.id,
          periodStart,
          periodEnd,
          status: 'draft',
          consumption: Math.round(consumptionShare),
          unitPrice,
          subtotal,
          vatRate,
          vatAmount,
          totalAmount,
          tariffId: tariff.id,
          tariffSnapshot,
        });

        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'consumption',
          description: 'Water consumption (shared)',
          quantity: consumptionShare,
          unitPrice,
          amount: subtotal,
        });
        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'vat',
          description: `VAT ${toMoney(vatRate * 100)}%`,
          amount: vatAmount,
        });
        await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: startReading.id, role: 'start' });
        await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: endReading.id, role: 'end' });

        created.push(invoice);
      }
    }

    return { success: true, data: { invoices: created, skipped } };
  },

  async generateDraftsFromReadings(
    referenceDate = new Date(),
    options?: {
      mode?: 'auto' | 'manual';
      overrideIssued?: boolean;
      overridePaid?: boolean;
      adminId?: string;
      jobRunId?: string;
    }
  ) {
    const meters = (await MeterRepository.listAll()).filter((meter) => meter.status === 'active');
    const created: any[] = [];
    const skipped: Array<{ meterId: string; reason: string }> = [];
    const { start: monthStart, end: monthEnd } = getMonthBounds(referenceDate);

    for (const meter of meters) {
      const existingInvoices = await BillingRepository.listInvoicesForMeterMonth({
        meterId: meter.id,
        monthStart,
        monthEnd,
      });
      const hasDraft = existingInvoices.some((invoice) => invoice.status === 'draft');
      const issuedInvoices = existingInvoices.filter((invoice) => invoice.status === 'issued');
      const paidInvoices = existingInvoices.filter((invoice) => invoice.status === 'paid');

      if (hasDraft) {
        skipped.push({ meterId: meter.id, reason: 'DRAFT_EXISTS' });
        continue;
      }

      const isManual = options?.mode === 'manual';
      if (!isManual && (issuedInvoices.length > 0 || paidInvoices.length > 0)) {
        skipped.push({ meterId: meter.id, reason: 'EXISTING_FINALIZED' });
        continue;
      }

      if (isManual) {
        if (issuedInvoices.length > 0 && !options?.overrideIssued) {
          skipped.push({ meterId: meter.id, reason: 'ISSUED_EXISTS' });
          continue;
        }
        if (paidInvoices.length > 0 && !options?.overridePaid) {
          skipped.push({ meterId: meter.id, reason: 'PAID_EXISTS' });
          continue;
        }

        if ((issuedInvoices.length > 0 || paidInvoices.length > 0) && !options?.adminId) {
          skipped.push({ meterId: meter.id, reason: 'MISSING_ADMIN' });
          continue;
        }

        for (const invoice of issuedInvoices) {
          if (options?.overrideIssued) {
            await BillingRepository.voidInvoice({
              invoiceId: invoice.id,
              adminId: options.adminId as string,
              prevStatus: 'issued',
              reason: 'manual_override',
              jobRunId: options.jobRunId ?? null,
            });
          }
        }

        for (const invoice of paidInvoices) {
          if (options?.overridePaid) {
            await BillingRepository.voidInvoice({
              invoiceId: invoice.id,
              adminId: options.adminId as string,
              prevStatus: 'paid',
              reason: 'manual_override',
              jobRunId: options.jobRunId ?? null,
            });
          }
        }
      }

      const flags: string[] = [];
      const endReading = await ReadingRepository.findLatestUnpaidReading(meter.id);
      let periodEnd: Date | null = null;
      let endValue = 0;
      if (endReading) {
        const endReadAt = new Date(endReading.readAt);
        if (isCurrentMonth(endReadAt, referenceDate)) {
          periodEnd = endReadAt;
          endValue = endReading.value;
        } else {
          flags.push('no_reading_current_month');
        }
      } else {
        flags.push('no_reading_current_month');
      }

      const startReading = await ReadingRepository.findLatestPaidReading(meter.id);
      const startValue = startReading ? startReading.value : 0;
      if (!startReading) {
        flags.push('no_previous_reading');
      }
      const periodStart = startReading ? new Date(startReading.readAt) : null;

      const consumptionTotal = periodEnd ? endValue - startValue : 0;
      if (consumptionTotal <= 0) {
        flags.push('non_positive_consumption');
      }

      const consumers = await MeterRepository.listConsumersForMeter(meter.id);
      if (!consumers.length) {
        skipped.push({ meterId: meter.id, reason: 'NO_CONSUMERS' });
        continue;
      }

      const tariff = await BillingRepository.findApplicableTariff({
        groupCode: meter.groupCode ?? null,
        periodStart: periodStart ?? periodEnd ?? referenceDate,
        periodEnd: periodEnd ?? periodStart ?? referenceDate,
      });
      if (!tariff) {
        skipped.push({ meterId: meter.id, reason: 'NO_TARIFF' });
        continue;
      }

      const unitPrice = toNumber(tariff.basePrice);
      const vatRate = 0.19;
      const tariffSnapshot = buildTariffSnapshot(tariff);

      if (consumers.length === 1) {
        const accountId = consumers[0].accountId;
        const subtotal = toMoney(consumptionTotal * unitPrice);
        const vatAmount = toMoney(subtotal * vatRate);
        const totalAmount = toMoney(subtotal + vatAmount);

        const invoice = await BillingRepository.createInvoice({
          accountId,
          meterId: meter.id,
          periodStart,
          periodEnd,
          status: 'draft',
          consumption: consumptionTotal,
          unitPrice,
          subtotal,
          vatRate,
          vatAmount,
          totalAmount,
          tariffId: tariff.id,
          tariffSnapshot,
          reviewFlags: flags.length ? flags : undefined,
        });

        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'consumption',
          description: 'Water consumption',
          quantity: toQuantity(consumptionTotal),
          unitPrice,
          amount: subtotal,
        });
        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'vat',
          description: `VAT ${toMoney(vatRate * 100)}%`,
          amount: vatAmount,
        });

        if (endReading && periodEnd) {
          await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: endReading.id, role: 'end' });
        }
        if (startReading) {
          await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: startReading.id, role: 'start' });
        }

        created.push(invoice);
        continue;
      }

      let householdTotal = 0;
      const householdSizes = consumers.map((consumer) => {
        const size = consumer.account.consumerProfile?.householdSize || 0;
        if (size <= 0) {
          return { accountId: consumer.accountId, size: 1, invalid: true };
        }
        return { accountId: consumer.accountId, size, invalid: false };
      });

      householdTotal = householdSizes.reduce((sum, entry) => sum + entry.size, 0);
      if (householdTotal <= 0) householdTotal = consumers.length;

      for (const consumer of consumers) {
        const sizeEntry = householdSizes.find((entry) => entry.accountId === consumer.accountId);
        const share = (sizeEntry?.size || 1) / householdTotal;
        const consumptionShare = toQuantity(consumptionTotal * share);
        const subtotal = toMoney(consumptionShare * unitPrice);
        const vatAmount = toMoney(subtotal * vatRate);
        const totalAmount = toMoney(subtotal + vatAmount);

        const invoiceFlags = [...flags];
        if (sizeEntry?.invalid) invoiceFlags.push('invalid_household_size');

        const invoice = await BillingRepository.createInvoice({
          accountId: consumer.accountId,
          meterId: meter.id,
          periodStart,
          periodEnd,
          status: 'draft',
          consumption: Math.round(consumptionShare),
          unitPrice,
          subtotal,
          vatRate,
          vatAmount,
          totalAmount,
          tariffId: tariff.id,
          tariffSnapshot,
          reviewFlags: invoiceFlags.length ? invoiceFlags : undefined,
        });

        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'consumption',
          description: 'Water consumption (shared)',
          quantity: consumptionShare,
          unitPrice,
          amount: subtotal,
        });
        await BillingRepository.addInvoiceLine({
          invoiceId: invoice.id,
          type: 'vat',
          description: `VAT ${toMoney(vatRate * 100)}%`,
          amount: vatAmount,
        });

        if (endReading && periodEnd) {
          await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: endReading.id, role: 'end' });
        }
        if (startReading) {
          await BillingRepository.addReadingLink({ invoiceId: invoice.id, readingId: startReading.id, role: 'start' });
        }

        created.push(invoice);
      }
    }

    return { success: true, data: { invoices: created, skipped } };
  },

  async confirmInvoices(ids: string[]) {
    if (!ids.length) return { success: false, error: 'NO_IDS' };
    const updated = await BillingRepository.bulkUpdateStatus({
      ids,
      status: 'confirmed',
      onlyFromStatus: 'draft',
    });
    return { success: true, data: { updated } };
  },

  async previewMonthlyOverrides(referenceDate = new Date()) {
    const meters = (await MeterRepository.listAll()).filter((meter) => meter.status === 'active');
    const meterIds = meters.map((meter) => meter.id);
    if (!meterIds.length) {
      return { success: true, data: { issued: 0, paid: 0 } };
    }
    const { start: monthStart, end: monthEnd } = getMonthBounds(referenceDate);
    const issued = await BillingRepository.countInvoicesForMonthByStatus({
      meterIds,
      monthStart,
      monthEnd,
      status: 'issued',
    });
    const paid = await BillingRepository.countInvoicesForMonthByStatus({
      meterIds,
      monthStart,
      monthEnd,
      status: 'paid',
    });
    return { success: true, data: { issued, paid } };
  },
};
