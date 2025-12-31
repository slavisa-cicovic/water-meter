import prisma from 'src/utils/prisma';
import { ReadingCreateInput, ReadingListParams, ReadingUpdateInput } from 'src/types/readings';

const toDate = (value: string) => new Date(value);
const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const toNextDayStart = (value: string) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
};

export const ReadingRepository = {
  async create(input: ReadingCreateInput) {
    return prisma.reading.create({
      data: {
        meterId: input.meterId,
        readerAccountId: input.readerAccountId,
        readAt: toDate(input.readAt),
        method: input.method,
        value: input.value,
        originalValue: input.originalValue ?? input.value,
        imageFilename: input.imageFilename ?? null,
      },
      include: { edits: { include: { account: true }, orderBy: { editedAt: 'desc' } }, meter: true },
    });
  },

  async update(input: ReadingUpdateInput) {
    return prisma.reading.update({
      where: { id: input.id },
      data: {
        ...(input.readAt !== undefined ? { readAt: toDate(input.readAt) } : {}),
        ...(input.value !== undefined ? { value: input.value } : {}),
        ...(input.imageFilename !== undefined ? { imageFilename: input.imageFilename } : {}),
      },
      include: { edits: { include: { account: true }, orderBy: { editedAt: 'desc' } }, meter: true },
    });
  },

  async findById(id: string) {
    return prisma.reading.findUnique({
      where: { id },
      include: { edits: { include: { account: true }, orderBy: { editedAt: 'desc' } }, meter: true },
    });
  },

  async list(params: ReadingListParams) {
    const { meterId, accountId, from, to, page = 0, pageSize = 25 } = params;

    const where: any = {
      ...(meterId ? { meterId } : {}),
      ...(accountId ? { readerAccountId: accountId } : {}),
      ...(from || to
        ? {
            readAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to
                ? isDateOnly(to)
                  ? { lt: toNextDayStart(to) }
                  : { lte: new Date(to) }
                : {}),
            },
          }
        : {}),
    };

    const [total, readings] = await Promise.all([
      prisma.reading.count({ where }),
      prisma.reading.findMany({
        where,
        orderBy: { readAt: 'desc' },
        skip: page * pageSize,
        take: pageSize,
        include: { edits: { include: { account: true }, orderBy: { editedAt: 'desc' } }, meter: true },
      }),
    ]);

    return { total, readings };
  },

  async findLatestForMeterBefore(meterId: string, before: Date) {
    return prisma.reading.findFirst({
      where: { meterId, readAt: { lte: before } },
      orderBy: { readAt: 'desc' },
      include: { edits: true },
    });
  },

  async findLatestForMeter(meterId: string) {
    return prisma.reading.findFirst({
      where: { meterId },
      orderBy: { readAt: 'desc' },
      include: { edits: true },
    });
  },

  async findLatestUnpaidReading(meterId: string) {
    return prisma.reading.findFirst({
      where: {
        meterId,
        invoiceLinks: {
          none: {
            invoice: { status: 'paid' },
          },
        },
      },
      orderBy: { readAt: 'desc' },
      include: { edits: true },
    });
  },

  async findLatestPaidReading(meterId: string) {
    return prisma.reading.findFirst({
      where: {
        meterId,
        invoiceLinks: {
          some: {
            invoice: { status: 'paid' },
          },
        },
      },
      orderBy: { readAt: 'desc' },
      include: { edits: true },
    });
  },

  async addEdit(params: {
    readingId: string;
    accountId: string;
    editorRole: 'admin' | 'consumer' | 'staff_field' | 'staff_backoffice';
    value: number;
    reason?: string;
  }) {
    return prisma.readingEdit.create({
      data: {
        readingId: params.readingId,
        accountId: params.accountId,
        editorRole: params.editorRole,
        value: params.value,
        reason: params.reason,
      },
    });
  },
};
