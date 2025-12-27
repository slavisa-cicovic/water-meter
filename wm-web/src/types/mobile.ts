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
  meter: MobileAccountMeter | null;
};

export type MobileProfileUpdateInput = {
  firstName: string;
  lastName: string;
  email: string;
};
