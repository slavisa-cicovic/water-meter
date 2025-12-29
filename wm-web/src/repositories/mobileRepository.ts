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
  ): Promise<Array<{ id: string; updatedAt: string; totalAmount: number; status: string }>> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    const invoices = await prisma.invoice.findMany({
      where: {
        accountId,
        status: "issued",
        updatedAt: { gte: start, lt: end },
      },
      orderBy: { updatedAt: "asc" },
      select: { id: true, updatedAt: true, totalAmount: true, status: true },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      updatedAt: invoice.updatedAt.toISOString(),
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
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },
};
