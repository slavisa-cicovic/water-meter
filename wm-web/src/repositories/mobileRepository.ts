import { AccountRole, Prisma } from "@prisma/client";
import prisma from "src/utils/prisma";
import { MobileAccountMeter, MobileProfileUpdateInput } from "src/types/mobile";

type AccountBase = Prisma.AccountGetPayload<{
  select: { id: true; firstName: true; lastName: true; email: true; address: true; role: true };
}>;

export const MobileRepository = {
  async findAccountBase(accountId: string): Promise<AccountBase | null> {
    return prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, firstName: true, lastName: true, email: true, address: true, role: true },
    });
  },

  async findMeterForConsumer(accountId: string): Promise<MobileAccountMeter | null> {
    const link = await prisma.meterConsumer.findFirst({
      where: { accountId },
      orderBy: { meterId: "asc" },
      include: { meter: true },
    });

    if (!link?.meter) {
      return null;
    }

    const sharedCount = await prisma.meterConsumer.count({
      where: { meterId: link.meterId },
    });

    return {
      serialNumber: link.meter.serialNumber,
      status: link.meter.status,
      shared: sharedCount > 1,
    };
  },

  async findConsumerMeterLink(accountId: string): Promise<{ meterId: string; serialNumber: string } | null> {
    const link = await prisma.meterConsumer.findFirst({
      where: { accountId },
      orderBy: { meterId: "asc" },
      include: { meter: true },
    });

    if (!link?.meter) {
      return null;
    }

    return { meterId: link.meterId, serialNumber: link.meter.serialNumber };
  },

  async listMeterReadingsForYear(
    meterId: string,
    year: number
  ): Promise<Array<{ id: string; readAt: string; value: number }>> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const readings = await prisma.reading.findMany({
      where: { meterId, readAt: { gte: start, lt: end } },
      orderBy: { readAt: "asc" },
      select: { id: true, readAt: true, value: true },
    });

    return readings.map((reading) => ({
      id: reading.id,
      readAt: reading.readAt.toISOString(),
      value: reading.value,
    }));
  },

  async listInvoicesForYear(
    accountId: string,
    year: number
  ): Promise<Array<{ id: string; periodEnd: string | null; totalAmount: number; status: string }>> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const invoices = await prisma.invoice.findMany({
      where: {
        accountId,
        status: "paid",
        periodEnd: { gte: start, lt: end },
      },
      orderBy: { periodEnd: "asc" },
      select: { id: true, updatedAt: true, totalAmount: true, status: true, periodEnd: true },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      periodEnd: invoice.periodEnd ? invoice.periodEnd.toISOString() : null,
      totalAmount: Number(invoice.totalAmount),
      status: invoice.status,
    }));
  },

  async findLatestPaidInvoiceReading(
    accountId: string,
    meterId: string
  ): Promise<{ value: number; readAt: string } | null> {
    const invoice = await prisma.invoice.findFirst({
      where: { accountId, meterId, status: "paid" },
      orderBy: { updatedAt: "desc" },
      select: {
        readings: {
          select: {
            role: true,
            reading: { select: { value: true, readAt: true } },
          },
        },
      },
    });

    if (!invoice || invoice.readings.length === 0) {
      return null;
    }

    type ReadingSnapshot = { value: number; readAt: Date };

    const endReading = invoice.readings.find((link) => link.role === "end")?.reading ?? null;
    let latest: ReadingSnapshot | null = null;

    invoice.readings.forEach((link) => {
      const reading = link.reading;
      if (!latest || reading.readAt > latest.readAt) {
        latest = reading;
      }
    });

    const resolved = endReading ?? latest;
    if (!resolved) return null;

    return { value: resolved.value, readAt: resolved.readAt.toISOString() };
  },

  async findLatestReadingBefore(
    meterId: string,
    before: Date
  ): Promise<{ id: string; readAt: string; value: number } | null> {
    const reading = await prisma.reading.findFirst({
      where: { meterId, readAt: { lt: before } },
      orderBy: { readAt: "desc" },
      select: { id: true, readAt: true, value: true },
    });

    if (!reading) return null;

    return {
      id: reading.id,
      readAt: reading.readAt.toISOString(),
      value: reading.value,
    };
  },

  async findLatestIssuedInvoice(accountId: string): Promise<{
    id: string;
    status: "issued";
    meterSerialNumber?: string;
    periodStart: Date | null;
    periodEnd: Date | null;
    consumption: number;
    previousValue: number | null;
    currentValue: number | null;
    unitPrice: number;
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    lines: Array<{
      id: string;
      type: "consumption" | "fee" | "vat";
      description?: string | null;
      quantity?: number | null;
      unitPrice?: number | null;
      amount: number;
    }>;
  } | null> {
    const invoice = await prisma.invoice.findFirst({
      where: { accountId, status: "issued" },
      orderBy: { updatedAt: "desc" },
      include: { lines: true, meter: true, readings: { include: { reading: true } } },
    });

    if (!invoice) return null;

    const startReading = invoice.readings.find((link) => link.role === "start")?.reading ?? null;
    const endReading = invoice.readings.find((link) => link.role === "end")?.reading ?? null;

    return {
      id: invoice.id,
      status: "issued",
      meterSerialNumber: invoice.meter?.serialNumber ?? undefined,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      consumption: invoice.consumption,
      previousValue: startReading?.value ?? null,
      currentValue: endReading?.value ?? null,
      unitPrice: Number(invoice.unitPrice),
      subtotal: Number(invoice.subtotal),
      vatRate: Number(invoice.vatRate),
      vatAmount: Number(invoice.vatAmount),
      totalAmount: Number(invoice.totalAmount),
      lines: invoice.lines.map((line) => ({
        id: line.id,
        type: line.type,
        description: line.description ?? undefined,
        quantity: line.quantity === null ? null : line.quantity ? Number(line.quantity) : null,
        unitPrice: line.unitPrice === null ? null : line.unitPrice ? Number(line.unitPrice) : null,
        amount: Number(line.amount),
      })),
    };
  },

  async hasIssuedInvoice(accountId: string): Promise<boolean> {
    const invoice = await prisma.invoice.findFirst({
      where: { accountId, status: "issued" },
      select: { id: true },
    });
    return Boolean(invoice);
  },

  async findMobileAccount(accountId: string): Promise<(AccountBase & { meter: MobileAccountMeter | null }) | null> {
    const account = await this.findAccountBase(accountId);
    if (!account) return null;

    const meter =
      account.role === AccountRole.consumer ? await this.findMeterForConsumer(accountId) : null;

    return { ...account, meter };
  },

  async updateProfile(accountId: string, input: MobileProfileUpdateInput): Promise<AccountBase | null> {
    try {
      return await prisma.account.update({
        where: { id: accountId },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        },
        select: { id: true, firstName: true, lastName: true, email: true, address: true, role: true },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },
};
