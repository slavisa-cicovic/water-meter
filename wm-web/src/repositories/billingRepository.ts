import { Prisma, PrismaClient } from '@prisma/client';
import prisma from 'src/utils/prisma';
import { InvoiceListParams, InvoiceStatus, TariffCreateInput, TariffUpdateInput } from 'src/types/billings';

const toDate = (value: string) => new Date(value);

export const BillingRepository = {
  async listTariffs() {
    return prisma.tariff.findMany({
      where: { deletedAt: null },
      orderBy: { validFrom: 'desc' },
    });
  },

  async findApplicableTariff(
    params: { groupCode?: string | null; periodStart: Date; periodEnd: Date },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    const { groupCode, periodStart, periodEnd } = params;
    const tariff = await client.tariff.findFirst({
      where: {
        ...(groupCode ? { groupCode } : {}),
        status: 'active',
        deletedAt: null,
        validFrom: { lte: periodEnd },
        OR: [{ validTo: null }, { validTo: { gte: periodStart } }],
      },
      orderBy: { validFrom: 'desc' },
    });
    if (tariff) return tariff;
    return client.tariff.findFirst({
      where: {
        groupCode: null,
        status: 'active',
        deletedAt: null,
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
        status: input.status ?? 'active',
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
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  },

  async findTariffById(id: string, client: Prisma.TransactionClient | PrismaClient = prisma) {
    return client.tariff.findUnique({ where: { id } });
  },

  async bulkUpdateTariffs(ids: string[], action: 'delete' | 'activate' | 'deactivate') {
    if (action === 'delete') {
      const result = await prisma.tariff.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: new Date(), status: 'inactive' },
      });
      return result.count;
    }
    const status = action === 'activate' ? 'active' : 'inactive';
    const result = await prisma.tariff.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { status },
    });
    return result.count;
  },

  async listInvoices(params: InvoiceListParams) {
    const {
      accountId,
      search,
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

    const searchWhere = search
      ? {
          OR: [
            { account: { firstName: { contains: search } } },
            { account: { lastName: { contains: search } } },
            { account: { address: { contains: search } } },
            { meter: { serialNumber: { contains: search } } },
          ],
        }
      : {};

    const createdStartDate = createdStart ? new Date(createdStart) : undefined;
    const createdEndDate = createdEnd ? new Date(createdEnd) : undefined;
    if (createdEndDate) {
      createdEndDate.setHours(23, 59, 59, 999);
    }

    const where: any = {
      ...searchWhere,
      ...(accountId ? { accountId } : {}),
      ...(status ? { status } : {}),
      ...reviewWhere,
      ...(createdStart || createdEnd
        ? {
            createdAt: {
              ...(createdStartDate ? { gte: createdStartDate } : {}),
              ...(createdEndDate ? { lte: createdEndDate } : {}),
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

  async countInvoicesByReviewFlag(flag: string, status?: InvoiceStatus) {
    return prisma.invoice.count({
      where: {
        ...(status ? { status } : {}),
        reviewFlags: { array_contains: [flag] },
      },
    });
  },

  async countDraftInvoicesWithoutFlags() {
    const emptyFlags = [] as Prisma.InputJsonValue;
    return prisma.invoice.count({
      where: {
        status: 'draft',
        OR: [{ reviewFlags: { equals: Prisma.DbNull } }, { reviewFlags: { equals: emptyFlags } }],
      },
    });
  },

  async findInvoicesByIds(ids: string[], client: Prisma.TransactionClient | PrismaClient = prisma) {
    return client.invoice.findMany({
      where: { id: { in: ids } },
      select: { id: true, status: true, reviewFlags: true },
    });
  },

  async findInvoiceById(id: string, client: Prisma.TransactionClient | PrismaClient = prisma) {
    return client.invoice.findUnique({
      where: { id },
      include: {
        lines: true,
        readings: { include: { reading: true } },
        tariff: true,
      },
    });
  },

  async createInvoice(
    data: {
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
    },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    return client.invoice.create({
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

  async listInvoicesForMeterMonth(
    params: { meterId: string; monthStart: Date; monthEnd: Date },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    const { meterId, monthStart, monthEnd } = params;
    return client.invoice.findMany({
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

  async listInvoicesForMeterPeriod(
    params: { meterId: string; periodStart: Date | null; periodEnd: Date | null },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    const { meterId, periodStart, periodEnd } = params;
    return client.invoice.findMany({
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

  async voidInvoice(
    params: {
    invoiceId: string;
    adminId: string;
    prevStatus: 'draft' | 'issued' | 'paid' | 'void';
    reason?: string;
    jobRunId?: string | null;
    },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    await client.invoice.update({
      where: { id: params.invoiceId },
      data: { status: 'void' },
    });

    await client.invoiceOverrideLog.create({
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

  async bulkUpdateStatus(
    params: {
    ids: string[];
    status: 'draft' | 'confirmed' | 'issued' | 'paid' | 'void';
    onlyFromStatus?: 'draft' | 'confirmed' | 'issued' | 'paid' | 'void';
    },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    const { ids, status, onlyFromStatus } = params;
    const where: any = { id: { in: ids } };
    if (onlyFromStatus) where.status = onlyFromStatus;

    const result = await client.invoice.updateMany({
      where,
      data: { status },
    });

    return result.count;
  },

  async addInvoiceLine(
    params: {
    invoiceId: string;
    type: 'consumption' | 'fee' | 'vat';
    description?: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
    },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    return client.invoiceLine.create({
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

  async addReadingLink(
    params: { invoiceId: string; readingId: string; role: 'start' | 'end' },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    return client.invoiceReadingLink.create({ data: params });
  },

  async updateInvoice(
    id: string,
    data: {
    consumption?: number;
    unitPrice?: number;
    subtotal?: number;
    vatRate?: number;
    vatAmount?: number;
    totalAmount?: number;
    periodStart?: Date | null;
    periodEnd?: Date | null;
    reviewFlags?: string[] | null;
    },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    const { reviewFlags, ...rest } = data;
    return client.invoice.update({
      where: { id },
      data: {
        ...rest,
        ...(reviewFlags !== undefined
          ? { reviewFlags: reviewFlags === null ? Prisma.DbNull : reviewFlags }
          : {}),
      },
    });
  },

  async updateInvoiceLineByType(
    params: {
    invoiceId: string;
    type: 'consumption' | 'fee' | 'vat';
    data: { quantity?: number; unitPrice?: number; amount?: number; description?: string | null };
    },
    client: Prisma.TransactionClient | PrismaClient = prisma
  ) {
    return client.invoiceLine.updateMany({
      where: { invoiceId: params.invoiceId, type: params.type },
      data: params.data,
    });
  },

  async bulkIssueConfirmed(client: Prisma.TransactionClient | PrismaClient = prisma) {
    const emptyFlags = [] as Prisma.InputJsonValue;
    const result = await client.invoice.updateMany({
      where: {
        status: 'confirmed',
        OR: [{ reviewFlags: { equals: Prisma.DbNull } }, { reviewFlags: { equals: emptyFlags } }],
      },
      data: { status: 'issued' },
    });
    return result.count;
  },

  async countIssueEligible(client: Prisma.TransactionClient | PrismaClient = prisma) {
    const emptyFlags = [] as Prisma.InputJsonValue;
    return client.invoice.count({
      where: {
        status: 'confirmed',
        OR: [{ reviewFlags: { equals: Prisma.DbNull } }, { reviewFlags: { equals: emptyFlags } }],
      },
    });
  },
};
