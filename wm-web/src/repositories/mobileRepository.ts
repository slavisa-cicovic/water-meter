import { AccountRole, Prisma } from "@prisma/client";
import prisma from "src/utils/prisma";
import { MobileAccountMeter, MobileProfileUpdateInput } from "src/types/mobile";

type AccountBase = Prisma.AccountGetPayload<{
  select: { id: true; firstName: true; lastName: true; email: true; role: true };
}>;

export const MobileRepository = {
  async findAccountBase(accountId: string): Promise<AccountBase | null> {
    return prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
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
