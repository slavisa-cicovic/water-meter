export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';
export type InvoiceLineType = 'consumption' | 'fee' | 'vat';
export type InvoiceReadingRole = 'start' | 'end';

export type Tariff = {
  id: string;
  name: string;
  basePrice: string;
  greenLimit: number;
  blueLimit: number;
  blueMultiplier: string;
  redMultiplier: string;
  validFrom: string;
  validTo?: string;
  groupCode?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Invoice = {
  id: string;
  accountId: string;
  meterId?: string;
  meter?: { serialNumber?: string };
  periodStart: string;
  periodEnd: string;
  status: InvoiceStatus;
  consumption: number;
  unitPrice: string;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  totalAmount: string;
  tariffId?: string;
  tariffSnapshot?: Record<string, any>;
  reviewFlags?: string[];
  createdAt?: string;
  updatedAt?: string;
  lines?: InvoiceLine[];
};

export type InvoiceLine = {
  id: string;
  invoiceId: string;
  type: InvoiceLineType;
  description?: string;
  quantity?: string;
  unitPrice?: string;
  amount: string;
};

export type InvoiceReadingLink = {
  id: string;
  invoiceId: string;
  readingId: string;
  role: InvoiceReadingRole;
};

export type TariffCreateInput = {
  name: string;
  basePrice: number;
  greenLimit: number;
  blueLimit: number;
  blueMultiplier: number;
  redMultiplier: number;
  validFrom: string;
  validTo?: string | null;
  groupCode?: string | null;
};

export type TariffUpdateInput = {
  id: string;
  name?: string;
  basePrice?: number;
  greenLimit?: number;
  blueLimit?: number;
  blueMultiplier?: number;
  redMultiplier?: number;
  validFrom?: string;
  validTo?: string | null;
  groupCode?: string | null;
};

export type InvoiceCreateInput = {
  accountId: string;
  meterId?: string;
  periodStart: string;
  periodEnd: string;
  vatRate?: number;
  tariffId?: string;
};

export type InvoiceListParams = {
  accountId?: string;
  meterId?: string;
  periodStart?: string;
  periodEnd?: string;
  status?: InvoiceStatus;
  review?: string;
  page?: number;
  pageSize?: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};
