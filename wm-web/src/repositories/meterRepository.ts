import { Prisma, PrismaClient } from '@prisma/client';
import prisma from 'src/utils/prisma';
import { MeterCreateInput, MeterListParams, MeterUpdateInput } from 'src/types/meters';

const toDateOrNull = (value: string | null | undefined) => (value == null ? null : new Date(value));

export const MeterRepository = {
  async create(input: MeterCreateInput) {
    return prisma.meter.create({
      data: {
        serialNumber: input.serialNumber,
        barcode: input.barcode ?? null,
        groupCode: input.groupCode ?? null,
        address: input.address,
        status: input.status ?? 'active',
        type: input.type ?? 'mechanical',
        installedAt: toDateOrNull(input.installedAt),
        notes: input.notes ?? null,
      },
    });
  },

  async softDelete(id: string) {
    return prisma.meter.update({
      where: { id },
      data: { status: 'removed' },
    });
  },

  async update(input: MeterUpdateInput) {
    return prisma.meter.update({
      where: { id: input.id },
      data: {
        ...(input.serialNumber !== undefined ? { serialNumber: input.serialNumber } : {}),
        ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
        ...(input.groupCode !== undefined ? { groupCode: input.groupCode } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.installedAt !== undefined ? { installedAt: toDateOrNull(input.installedAt) } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });
  },

  async findById(id: string, client: Prisma.TransactionClient | PrismaClient = prisma) {
    return client.meter.findUnique({
      where: { id },
      include: { consumers: { include: { account: true } } },
    });
  },

  async list(params: MeterListParams) {
    const {
      search,
      status,
      groupCode,
      type,
      review,
      consumerAccountId,
      orderBy = 'createdAt',
      order = 'desc',
      page = 0,
      pageSize = 25,
    } = params;

    const where: any = {
      ...(status ? { status } : {}),
      ...(groupCode ? { groupCode } : {}),
      ...(type ? { type } : {}),
      ...(review === 'pending' ? { readings: { some: { barcodeStatus: 'pending' } } } : {}),
      ...(search
        ? {
            OR: [
              { serialNumber: { contains: search } },
              { address: { contains: search } },
              { groupCode: { contains: search } },
            ],
          }
        : {}),
      ...(consumerAccountId ? { consumers: { some: { accountId: consumerAccountId } } } : {}),
    };

    const orderByClause =
      orderBy === 'serialNumber'
        ? [{ serialNumber: order }]
        : orderBy === 'groupCode'
        ? [{ groupCode: order }]
        : orderBy === 'address'
        ? [{ address: order }]
        : orderBy === 'type'
        ? [{ type: order }]
        : orderBy === 'status'
        ? [{ status: order }]
        : [{ createdAt: order }];

    const [total, meters] = await Promise.all([
      prisma.meter.count({ where }),
      prisma.meter.findMany({
        where,
        orderBy: orderByClause,
        skip: page * pageSize,
        take: pageSize,
        include: {
          consumers: true,
          readings: {
            where: { barcodeStatus: 'pending' },
            select: { id: true },
          },
        },
      }),
    ]);

    return { total, meters };
  },

  async addConsumerLink(meterId: string, accountId: string) {
    return prisma.meterConsumer.create({
      data: { meterId, accountId },
    });
  },

  async removeConsumerLink(meterId: string, accountId: string) {
    return prisma.meterConsumer.delete({
      where: { meterId_accountId: { meterId, accountId } },
    });
  },

  async listConsumersForMeter(meterId: string, client: Prisma.TransactionClient | PrismaClient = prisma) {
    return client.meterConsumer.findMany({
      where: { meterId },
      include: { account: { include: { consumerProfile: true } } },
      orderBy: { accountId: 'asc' },
    });
  },

  async listByConsumer(accountId: string) {
    return prisma.meter.findMany({
      where: { consumers: { some: { accountId } } },
      orderBy: { createdAt: 'asc' },
    });
  },

  async listAll() {
    return prisma.meter.findMany({ orderBy: { createdAt: 'asc' } });
  },
};
