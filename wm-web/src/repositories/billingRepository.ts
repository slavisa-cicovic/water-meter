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
    const {
      accountId,
      meterId,
      createdStart,
      createdEnd,
      status,
      reviewFlags,
      orderBy,
      order = 'desc',
      page = 0,
      pageSize = 25,
    } = params;

    const hasNoFlags = reviewFlags?.includes('no_flags') ?? false;
    const normalizedFlags = reviewFlags?.filter((flag) => flag !== 'no_flags') ?? [];
    const emptyFlags = [] as Prisma.InputJsonValue;

    const reviewWhere =
      hasNoFlags || normalizedFlags.length
        ? {
            OR: [
              ...(normalizedFlags.length
                ? normalizedFlags.map((flag) => ({
                    reviewFlags: { array_contains: [flag] },
                  }))
                : []),
              ...(hasNoFlags
                ? [
                    { reviewFlags: { equals: Prisma.DbNull } },
                    { reviewFlags: { equals: emptyFlags } },
                  ]
                : []),
            ],
          }
        : {};

    const where: any = {
      ...(accountId ? { accountId } : {}),
      ...(meterId ? { meterId } : {}),
      ...(status ? { status } : {}),
      ...reviewWhere,
      ...(createdStart || createdEnd
        ? {
            createdAt: {
              ...(createdStart ? { gte: new Date(createdStart) } : {}),
              ...(createdEnd ? { lte: new Date(createdEnd) } : {}),
            },
          }
        : {}),
    };

    const orderByClause: Prisma.InvoiceOrderByWithRelationInput | Prisma.InvoiceOrderByWithRelationInput[] =
      orderBy === 'account'
        ? [{ account: { lastName: order } }, { account: { firstName: order } }]
        : orderBy === 'meter'
        ? { meter: { serialNumber: order } }
        : orderBy === 'consumption'
        ? { consumption: order }
        : orderBy === 'totalAmount'
        ? { totalAmount: order }
        : orderBy === 'status'
        ? { status: order }
        : orderBy === 'createdAt'
        ? { createdAt: order }
        : orderBy === 'updatedAt'
        ? { updatedAt: order }
        : { createdAt: 'desc' as Prisma.SortOrder };

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        orderBy: orderByClause,
        skip: page * pageSize,
        take: pageSize,
        include: { lines: true, meter: true, account: { include: { consumerProfile: true } } },
      }),
    ]);

    return { total, invoices };
  },

  async findInvoicesByIds(ids: string[]) {
    return prisma.invoice.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true, reviewFlags: true },
    });
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

  async listInvoicesForMeterPeriod(params: { meterId: string; periodStart: Date | null; periodEnd: Date | null }) {
    const { meterId, periodStart, periodEnd } = params;
    return prisma.invoice.findMany({
      where: {
        meterId,
        periodStart,
        periodEnd,
      },
      include: { lines: true, readings: { include: { reading: true } }, account: true },
      orderBy: { createdAt: 'asc' },
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

  async bulkUpdateStatus(params: {
    ids: string[];
    status: 'draft' | 'confirmed' | 'issued' | 'paid' | 'void';
    onlyFromStatus?: 'draft' | 'confirmed' | 'issued' | 'paid' | 'void';
  }) {
    const { ids, status, onlyFromStatus } = params;
    const where: any = { id: { in: ids } };
    if (onlyFromStatus) where.status = onlyFromStatus;

    const result = await prisma.invoice.updateMany({
      where,
      data: { status },
    });

    return result.count;
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

  async updateInvoice(id: string, data: {
    consumption?: number;
    unitPrice?: number;
    subtotal?: number;
    vatRate?: number;
    vatAmount?: number;
    totalAmount?: number;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    reviewFlags?: string[] | null;
  }) {
    const { reviewFlags, ...rest } = data;
    return prisma.invoice.update({
      where: { id },
      data: {
        ...rest,
        ...(reviewFlags !== undefined
          ? { reviewFlags: reviewFlags === null ? Prisma.DbNull : reviewFlags }
          : {}),
      },
    });
  },

  async updateInvoiceLineByType(params: {
    invoiceId: string;
    type: 'consumption' | 'fee' | 'vat';
    data: { quantity?: number; unitPrice?: number; amount?: number; description?: string | null };
  }) {
    return prisma.invoiceLine.updateMany({
      where: { invoiceId: params.invoiceId, type: params.type },
      data: params.data,
    });
  },
};
