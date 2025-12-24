import { Prisma } from '@prisma/client';
import prisma from 'src/utils/prisma';
import { InvoiceListParams, TariffCreateInput, TariffUpdateInput } from 'src/types/billings';

const toDate = (value: string) => new Date(value);

export const BillingRepository = {
  async listTariffs() {
    return prisma.tariff.findMany({ orderBy: { validFrom: 'desc' } });
  },

  async findApplicableTariff(params: { groupCode?: string | null; periodStart: Date; periodEnd: Date }) {
    const { groupCode, periodStart, periodEnd } = params;
    const tariff = await prisma.tariff.findFirst({
      where: {
        ...(groupCode ? { groupCode } : {}),
        validFrom: { lte: periodEnd },
        OR: [{ validTo: null }, { validTo: { gte: periodStart } }],
      },
      orderBy: { validFrom: 'desc' },
    });
    if (tariff) return tariff;
    return prisma.tariff.findFirst({
      where: {
        groupCode: null,
        validFrom: { lte: periodEnd },
        OR: [{ validTo: null }, { validTo: { gte: periodStart } }],
      },
      orderBy: { validFrom: 'desc' },
    });
  },

  async createTariff(input: TariffCreateInput) {
    return prisma.tariff.create({
      data: {
        name: input.name,
        basePrice: input.basePrice,
        greenLimit: input.greenLimit,
        blueLimit: input.blueLimit,
        blueMultiplier: input.blueMultiplier,
        redMultiplier: input.redMultiplier,
        validFrom: toDate(input.validFrom),
        validTo: input.validTo ? toDate(input.validTo) : null,
        groupCode: input.groupCode ?? null,
      },
    });
  },

  async updateTariff(input: TariffUpdateInput) {
    return prisma.tariff.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.basePrice !== undefined ? { basePrice: input.basePrice } : {}),
        ...(input.greenLimit !== undefined ? { greenLimit: input.greenLimit } : {}),
        ...(input.blueLimit !== undefined ? { blueLimit: input.blueLimit } : {}),
        ...(input.blueMultiplier !== undefined ? { blueMultiplier: input.blueMultiplier } : {}),
        ...(input.redMultiplier !== undefined ? { redMultiplier: input.redMultiplier } : {}),
        ...(input.validFrom !== undefined ? { validFrom: toDate(input.validFrom) } : {}),
        ...(input.validTo !== undefined ? { validTo: input.validTo ? toDate(input.validTo) : null } : {}),
        ...(input.groupCode !== undefined ? { groupCode: input.groupCode } : {}),
      },
    });
  },

  async listInvoices(params: InvoiceListParams) {
    const { accountId, meterId, createdStart, createdEnd, status, review, page = 0, pageSize = 25 } = params;

    const where: any = {
      ...(accountId ? { accountId } : {}),
      ...(meterId ? { meterId } : {}),
      ...(status ? { status } : {}),
      ...(review === 'none'
        ? { reviewFlags: { equals: Prisma.DbNull } }
        : review
        ? { reviewFlags: { array_contains: [review] } }
        : {}),
      ...(createdStart || createdEnd
        ? {
            createdAt: {
              ...(createdStart ? { gte: new Date(createdStart) } : {}),
              ...(createdEnd ? { lte: new Date(createdEnd) } : {}),
            },
          }
        : {}),
    };

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        orderBy: { periodStart: 'desc' },
        skip: page * pageSize,
        take: pageSize,
        include: { lines: true, meter: true, account: true },
      }),
    ]);

    return { total, invoices };
  },

  async findInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: true,
        readings: { include: { reading: true } },
        tariff: true,
      },
    });
  },

  async createInvoice(data: {
    accountId: string;
    meterId?: string | null;
    periodStart: Date | null;
    periodEnd: Date | null;
    status: 'draft' | 'issued' | 'paid' | 'void';
    consumption: number;
    unitPrice: number;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    tariffId?: string | null;
    tariffSnapshot?: Record<string, any> | null;
    reviewFlags?: string[] | null;
  }) {
    return prisma.invoice.create({
      data: {
        accountId: data.accountId,
        meterId: data.meterId ?? null,
        periodStart: data.periodStart ?? null,
        periodEnd: data.periodEnd ?? null,
        status: data.status,
        consumption: data.consumption,
        unitPrice: data.unitPrice,
        subtotal: data.subtotal,
        vatRate: data.vatRate,
        vatAmount: data.vatAmount,
        totalAmount: data.totalAmount,
        tariffId: data.tariffId ?? null,
        tariffSnapshot: data.tariffSnapshot ?? undefined,
        reviewFlags: data.reviewFlags ?? undefined,
      },
      include: { lines: true },
    });
  },

  async listInvoicesForMeterMonth(params: { meterId: string; monthStart: Date; monthEnd: Date }) {
    const { meterId, monthStart, monthEnd } = params;
    return prisma.invoice.findMany({
      where: {
        meterId,
        OR: [
          { periodEnd: { gte: monthStart, lte: monthEnd } },
          { periodEnd: null, createdAt: { gte: monthStart, lte: monthEnd } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async countInvoicesForMonthByStatus(params: {
    meterIds: string[];
    monthStart: Date;
    monthEnd: Date;
    status: 'draft' | 'issued' | 'paid' | 'void';
  }) {
    const { meterIds, monthStart, monthEnd, status } = params;
    return prisma.invoice.count({
      where: {
        status,
        meterId: { in: meterIds },
        OR: [
          { periodEnd: { gte: monthStart, lte: monthEnd } },
          { periodEnd: null, createdAt: { gte: monthStart, lte: monthEnd } },
        ],
      },
    });
  },

  async voidInvoice(params: {
    invoiceId: string;
    adminId: string;
    prevStatus: 'draft' | 'issued' | 'paid' | 'void';
    reason?: string;
    jobRunId?: string | null;
  }) {
    await prisma.invoice.update({
      where: { id: params.invoiceId },
      data: { status: 'void' },
    });

    await prisma.invoiceOverrideLog.create({
      data: {
        invoiceId: params.invoiceId,
        adminId: params.adminId,
        prevStatus: params.prevStatus,
        newStatus: 'void',
        reason: params.reason ?? null,
        jobRunId: params.jobRunId ?? null,
      },
    });
  },

  async addInvoiceLine(params: {
    invoiceId: string;
    type: 'consumption' | 'fee' | 'vat';
    description?: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
  }) {
    return prisma.invoiceLine.create({
      data: {
        invoiceId: params.invoiceId,
        type: params.type,
        description: params.description,
        quantity: params.quantity,
        unitPrice: params.unitPrice,
        amount: params.amount,
      },
    });
  },

  async addReadingLink(params: { invoiceId: string; readingId: string; role: 'start' | 'end' }) {
    return prisma.invoiceReadingLink.create({ data: params });
  },
};
