import { MobileRepository } from "src/repositories/mobileRepository";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileProfileUpdateInput,
} from "src/types/mobile";
import { validateMobileProfileUpdate } from "src/validation/mobile";
import { Prisma } from "@prisma/client";

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; details?: Record<string, string[]> };

const toMobileAccountData = (record: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  meter: MobileAccountData["meter"];
}): MobileAccountData => ({
  id: record.id,
  firstName: record.firstName,
  lastName: record.lastName,
  email: record.email,
  address: record.address,
  meter: record.meter ?? null,
});

export const MobileService = {
  async getAccount(accountId: string): Promise<ServiceResult<MobileAccountData>> {
    const account = await MobileRepository.findMobileAccount(accountId);
    if (!account) {
      return { success: false, error: "NOT_FOUND" };
    }
    return { success: true, data: toMobileAccountData(account) };
  },

  async updateProfile(accountId: string, input: MobileProfileUpdateInput): Promise<ServiceResult<MobileAccountData>> {
    const validation = validateMobileProfileUpdate(input);
    if (!validation.valid) {
      return { success: false, error: "VALIDATION_FAILED", details: validation.errors };
    }

    try {
      const updated = await MobileRepository.updateProfile(accountId, input);
      if (!updated) {
        return { success: false, error: "NOT_FOUND" };
      }
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { success: false, error: "ACCOUNT_EXISTS" };
      }
      return { success: false, error: "SERVER_ERROR" };
    }

    const refreshed = await MobileRepository.findMobileAccount(accountId);
    if (!refreshed) {
      return { success: false, error: "NOT_FOUND" };
    }
    return { success: true, data: toMobileAccountData(refreshed) };
  },

  async getConsumption(accountId: string, year: number): Promise<ServiceResult<MobileConsumptionData>> {
    const meter = await MobileRepository.findConsumerMeterLink(accountId);
    if (!meter) {
      const rows = buildEmptyRows();
      return {
        success: true,
        data: { year, meter: null, chart: rows.map((row) => ({ month: row.month, consumption: row.consumption })), rows },
      };
    }

    const readings = await MobileRepository.listMeterReadingsForYear(meter.meterId, year);
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const previous = await MobileRepository.findLatestReadingBefore(meter.meterId, yearStart);
    const rows = buildYearlyRows(readings, year, previous?.value ?? null);
    const chart = rows.map((row) => ({ month: row.month, consumption: row.consumption }));

    return {
      success: true,
      data: {
        year,
        meter: { id: meter.meterId, serialNumber: meter.serialNumber },
        chart,
        rows,
      },
    };
  },

  async getBilling(accountId: string, year: number): Promise<ServiceResult<MobileBillingData>> {
    const invoices = await MobileRepository.listInvoicesForYear(accountId, year);
    const rows = buildBillingRows(invoices, year);
    const chart = rows.map((row) => ({ month: row.month, amount: row.amount }));

    return { success: true, data: { year, chart, rows } };
  },
};

const buildEmptyRows = (): Array<{ month: number; previous: number | null; current: number | null; consumption: number }> =>
  Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    previous: null,
    current: null,
    consumption: 0,
  }));

const buildYearlyRows = (
  readings: { readAt: string; value: number }[],
  year: number,
  previousValue: number | null
): Array<{ month: number; previous: number | null; current: number | null; consumption: number }> => {
  const buckets = Array.from({ length: 12 }, () => [] as { value: number; readAt: string }[]);

  readings.forEach((reading) => {
    const date = new Date(reading.readAt);
    if (date.getUTCFullYear() !== year) return;
    const monthIndex = date.getUTCMonth();
    buckets[monthIndex].push(reading);
  });

  let rollingPrevious = previousValue;

  return buckets.map((items, index) => {
    if (!items.length) {
      return { month: index + 1, previous: null, current: null, consumption: 0 };
    }

    const sorted = items.slice().sort((a, b) => new Date(a.readAt).getTime() - new Date(b.readAt).getTime());
    const last = sorted[sorted.length - 1];
    const baseValue = rollingPrevious ?? (sorted.length > 1 ? sorted[0].value : last.value);
    const consumption = last.value - baseValue;
    rollingPrevious = last.value;

    return {
      month: index + 1,
      previous: baseValue,
      current: last.value,
      consumption,
    };
  });
};

const buildBillingRows = (
  invoices: Array<{ updatedAt: string; totalAmount: number; status: string }>,
  year: number
): Array<{ month: number; amount: number; status: MobileBillingData["rows"][number]["status"] }> =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthInvoices = invoices.filter((invoice) => {
      const date = new Date(invoice.updatedAt);
      return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
    });

    if (!monthInvoices.length) {
      return { month, amount: 0, status: null };
    }

    const amount = monthInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const latest = monthInvoices[monthInvoices.length - 1];
    return {
      month,
      amount,
      status: latest.status as MobileBillingData["rows"][number]["status"],
    };
  });
