import { BillingRepository } from 'src/repositories/billingRepository';
import { MeterRepository } from 'src/repositories/meterRepository';
import { ReadingRepository } from 'src/repositories/readingRepository';
import { InvoiceCreateInput, TariffCreateInput, TariffUpdateInput } from 'src/types/billings';
import { validateInvoiceCreate, validateTariffCreate, validateTariffUpdate } from 'src/validation/billings';

const toNumber = (value: any) => Number(value);
const toMoney = (value: number) => Number(value.toFixed(2));
const toQuantity = (value: number) => Number(value.toFixed(3));

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
        periodStart,
        periodEnd,
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
};

