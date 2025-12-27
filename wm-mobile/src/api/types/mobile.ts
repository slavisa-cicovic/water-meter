export type MobileAccountMeter = {
  serialNumber: string;
  shared: boolean;
  status: "active" | "inactive" | "removed";
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
