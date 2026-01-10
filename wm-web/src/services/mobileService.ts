import { MobileRepository } from "src/repositories/mobileRepository";
import {
  MobileAccountData,
  MobileBillingData,
  MobileConsumptionData,
  MobileLocaleUpdateInput,
  MobileProfileUpdateInput,
  MobileReadingContext,
  MobilePaymentInvoice,
  MobileNotificationsData,
  MobileStaffMetersData,
} from "src/types/mobile";
import { validateMobileProfileUpdate } from "src/validation/mobile";
import { Prisma } from "@prisma/client";
import { ReadingsService } from "src/services/readingsService";
import { Reading, ReadingCreateInput } from "src/types/readings";
import { AuthorizationService } from "src/services/authorizationService";
import { PERMISSIONS } from "src/constants/permissions";
import { SettingsService } from "src/services/settingsService";

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string; details?: Record<string, string[]> };

const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = new Set(["en", "sr", "sr-Latn", "sr-Cyrl"]);

const normalizeLocale = (value?: string | null) => {
  if (!value) return DEFAULT_LOCALE;
  if (value === "sr") return "sr-Latn";
  return SUPPORTED_LOCALES.has(value) ? value : DEFAULT_LOCALE;
};

const resolveCurrency = async () => {
  const settings = await SettingsService.getSettings();
  return settings.success ? settings.data.currency : "RSD";
};

const toMobileAccountData = (record: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  locale?: string | null;
  meter: MobileAccountData["meter"];
}): MobileAccountData => ({
  id: record.id,
  firstName: record.firstName,
  lastName: record.lastName,
  email: record.email,
  address: record.address,
  locale: normalizeLocale(record.locale),
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
      const updated = await MobileRepository.updateProfile(accountId, {
        ...input,
        locale: input.locale ? normalizeLocale(input.locale) : undefined,
      });
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

  async updateLocale(accountId: string, input: MobileLocaleUpdateInput): Promise<ServiceResult<MobileAccountData>> {
    if (!SUPPORTED_LOCALES.has(input.locale)) {
      return { success: false, error: "VALIDATION_FAILED", details: { locale: ["Invalid locale"] } };
    }
    const locale = normalizeLocale(input.locale);

    const updated = await MobileRepository.updateLocale(accountId, locale);
    if (!updated) {
      return { success: false, error: "NOT_FOUND" };
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
    const currency = await resolveCurrency();

    return { success: true, data: { year, chart, rows, currency } };
  },

  async getLatestIssuedInvoice(accountId: string): Promise<ServiceResult<{ invoice: MobilePaymentInvoice | null }>> {
    const invoice = await MobileRepository.findLatestIssuedInvoice(accountId);
    if (!invoice) {
      return { success: true, data: { invoice: null } };
    }
    const currency = await resolveCurrency();

    return {
      success: true,
      data: {
        invoice: {
          id: invoice.id,
          status: "issued",
          currency,
          meterSerialNumber: invoice.meterSerialNumber,
          periodStart: invoice.periodStart ? invoice.periodStart.toISOString() : null,
          periodEnd: invoice.periodEnd ? invoice.periodEnd.toISOString() : null,
          consumption: invoice.consumption,
          previousValue: invoice.previousValue,
          currentValue: invoice.currentValue,
          unitPrice: invoice.unitPrice,
          subtotal: invoice.subtotal,
          vatRate: invoice.vatRate,
          vatAmount: invoice.vatAmount,
          totalAmount: invoice.totalAmount,
          lines: invoice.lines.map((line) => ({
            id: line.id,
            type: line.type,
            description: line.description ?? undefined,
            quantity: line.quantity ?? null,
            unitPrice: line.unitPrice ?? null,
            amount: line.amount,
          })),
        },
      },
    };
  },

  async getNotifications(accountId: string): Promise<ServiceResult<MobileNotificationsData>> {
    const hasIssuedInvoice = await MobileRepository.hasIssuedInvoice(accountId);
    return { success: true, data: { hasIssuedInvoice } };
  },

  async getStaffMeters(accountId: string): Promise<ServiceResult<MobileStaffMetersData>> {
    const roles = await AuthorizationService.getRoleSlugsForAccount(accountId);
    if (!roles.includes("staff_field")) {
      return { success: false, error: "FORBIDDEN" };
    }
    const meters = await MobileRepository.listMetersWithConsumersForField();
    return { success: true, data: { meters } };
  },

  async getReadingContext(
    accountId: string,
    meterId?: string
  ): Promise<ServiceResult<MobileReadingContext>> {
    const roles = await AuthorizationService.getRoleSlugsForAccount(accountId);
    if (roles.includes("staff_field")) {
      if (!meterId) {
        const meters = await MobileRepository.listMetersForField();
        return { success: true, data: { meter: null, previousPaidValue: 0, meters } };
      }

      const meter = await MobileRepository.findMeterSummary(meterId);
      if (!meter) {
        return { success: true, data: { meter: null, previousPaidValue: 0 } };
      }

      const latestPaid = await MobileRepository.findLatestPaidReadingForMeter(meter.id);
      return {
        success: true,
        data: {
          meter: { id: meter.id, serialNumber: meter.serialNumber },
          previousPaidValue: latestPaid?.value ?? 0,
        },
      };
    }

    const meter = await MobileRepository.findConsumerMeterLink(accountId);
    if (!meter) {
      return { success: true, data: { meter: null, previousPaidValue: 0 } };
    }

    const latestPaid = await MobileRepository.findLatestPaidInvoiceReading(accountId, meter.meterId);
    return {
      success: true,
      data: {
        meter: { id: meter.meterId, serialNumber: meter.serialNumber },
        previousPaidValue: latestPaid?.value ?? 0,
      },
    };
  },

  async createReading(
    accountId: string,
    input: Omit<ReadingCreateInput, "readerAccountId">
  ): Promise<ServiceResult<{ reading: Reading }>> {
    const result = await ReadingsService.create(
      { ...input, readerAccountId: accountId },
      { permissionSlug: PERMISSIONS.MOBILE_READINGS_CREATE }
    );
    if (!result.success) {
      return { success: false, error: result.error ?? "SERVER_ERROR", details: result.details };
    }
    if (!result.data?.reading) {
      return { success: false, error: "SERVER_ERROR" };
    }
    return { success: true, data: result.data };
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
    const consumption = Math.round((last.value - baseValue) * 100) / 100;
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
  invoices: Array<{ periodEnd: string | null; totalAmount: number; status: string }>,
  year: number
): Array<{ month: number; amount: number; status: MobileBillingData["rows"][number]["status"] }> =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthInvoices = invoices.filter((invoice) => {
      if (!invoice.periodEnd) return false;
      const date = new Date(invoice.periodEnd);
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
