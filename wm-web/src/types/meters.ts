export type MeterStatus = 'active' | 'inactive' | 'removed';
export type MeterType = 'automatic' | 'mechanical';

export type GroupCode = string; // expected format: "01".."99" (validated in `src/validation/meters.ts`)

export type Meter = {
  id: string;
  serialNumber: string;
  groupCode?: GroupCode;
  address: string;
  status: MeterStatus;
  type: MeterType;
  consumersCount?: number;
  installedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MeterCreateInput = {
  serialNumber: string;
  groupCode?: GroupCode | null;
  address: string;
  status?: MeterStatus;
  type?: MeterType;
  installedAt?: string | null;
  notes?: string | null;
};

export type MeterUpdateInput = {
  id: string;
  serialNumber?: string;
  groupCode?: GroupCode | null;
  address?: string;
  status?: MeterStatus;
  type?: MeterType;
  installedAt?: string | null;
  notes?: string | null;
};

export type MeterConsumerLinkInput = {
  meterId: string;
  accountId: string;
};

export type MeterListParams = {
  search?: string;
  status?: MeterStatus;
  groupCode?: GroupCode;
  type?: MeterType;
  consumerAccountId?: string;
  orderBy?: 'serialNumber' | 'groupCode' | 'address' | 'type' | 'status' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};
