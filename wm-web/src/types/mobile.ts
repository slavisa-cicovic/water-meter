import type { MeterStatus } from "src/types/meters";

export type MobileAccountMeter = {
  serialNumber: string;
  shared: boolean;
  status: MeterStatus;
};

export type MobileAccountData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  locale?: string | null;
  meter: MobileAccountMeter | null;
};

export type MobileProfileUpdateInput = {
  firstName: string;
  lastName: string;
  email: string;
  locale?: string | null;
};

export type MobileLocaleUpdateInput = {
  locale: string;
};

export type MobileConsumptionPoint = {
  month: number;
  consumption: number;
};

export type MobileConsumptionRow = {
  month: number;
  previous: number | null;
  current: number | null;
  consumption: number;
};

export type MobileConsumptionData = {
  year: number;
  meter: { id: string; serialNumber: string } | null;
  chart: MobileConsumptionPoint[];
  rows: MobileConsumptionRow[];
};

export type MobileBillingPoint = {
  month: number;
  amount: number;
};

export type MobileBillingRow = {
  month: number;
  amount: number;
  status: "draft" | "confirmed" | "issued" | "paid" | "void" | null;
};

export type MobileBillingData = {
  year: number;
  chart: MobileBillingPoint[];
  rows: MobileBillingRow[];
  currency: string;
};

export type MobileReadingContext = {
  meter: { id: string; serialNumber: string } | null;
  previousPaidValue: number;
  meters?: Array<{
    id: string;
    serialNumber: string;
    address: string | null;
    shared: boolean;
  }>;
};

export type MobileStaffMeterConsumer = {
  id: string;
  firstName: string;
  lastName: string;
  householdSize: number | null;
};

export type MobileStaffMeter = {
  id: string;
  serialNumber: string;
  address: string | null;
  shared: boolean;
  consumerCount: number;
  consumers: MobileStaffMeterConsumer[];
};

export type MobileStaffMetersData = {
  meters: MobileStaffMeter[];
};

export type MobilePaymentInvoiceLine = {
  id: string;
  type: "consumption" | "fee" | "vat";
  description?: string;
  quantity?: number | null;
  unitPrice?: number | null;
  amount: number;
};

export type MobilePaymentInvoice = {
  id: string;
  status: "issued";
  currency: string;
  meterSerialNumber?: string;
  periodStart: string | null;
  periodEnd: string | null;
  consumption: number;
  previousValue: number | null;
  currentValue: number | null;
  unitPrice: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  lines: MobilePaymentInvoiceLine[];
};

export type MobileNotificationsData = {
  hasIssuedInvoice: boolean;
};
