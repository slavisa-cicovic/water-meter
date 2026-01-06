export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type AccountRole = string;

export type StaffRole = 'field' | 'backoffice';

export type VerificationAuditEntry = {
  id: string;
  accountId: string;
  reviewerId: string;
  status: VerificationStatus;
  note?: string;
  reviewedAt: string;
};

export type BaseAccount = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  role: AccountRole;
  verificationStatus: VerificationStatus;
  verificationLog?: VerificationAuditEntry[];
  createdAt?: string;
  updatedAt?: string;
};

export type ConsumerAccount = BaseAccount & {
  role: string;
  householdSize: number;
  avatar?: never;
};

export type StaffAccount = BaseAccount & {
  role: string;
  staffRole: StaffRole;
  avatar?: string;
};

export type ConsumerRegistrationInput = {
  firstName: string;
  lastName: string;
  address: string;
  householdSize: number;
  email: string;
  phone?: string;
  password: string;
};

export type StaffRegistrationInput = {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone?: string;
  password: string;
  staffRole: StaffRole;
};

export type VerificationAction = {
  accountId: string;
  status: VerificationStatus;
  reviewerId: string;
  note?: string;
  reviewedAt?: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string[]>;
};

export type VerificationResponse = {
  id: string;
  verificationStatus: VerificationStatus;
  auditEntry: VerificationAuditEntry;
  token?: string;
};

export type AccountUpdateInput = {
  firstName: string;
  lastName: string;
  address: string;
  tariffId?: string | null;
  updateMeterAddress?: boolean;
};

export type AccountTokenPayload = {
  accountId: string;
  role: AccountRole;
  roles?: string[];
  verificationStatus: VerificationStatus;
  permissionsVersion: number;
  issuedAt: string;
};

type BaseAccountRow = {
  id: string;
  type: string;
  verificationStatus: VerificationStatus;
  createdAt?: string;
  updatedAt?: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    householdSize?: number;
    staffRole?: string;
    tariffId?: string | null;
  };
  verificationLog?: VerificationAuditEntry[];
};

export type ConsumerAccountRow = BaseAccountRow & {
  type: string;
  avatar?: never;
};

export type NonConsumerAccountRow = BaseAccountRow & {
  type: string;
  avatar?: string;
};

export type AccountRow = ConsumerAccountRow | NonConsumerAccountRow;

export type IAccountTableFilterValue = string;

export type IAccountTableFilters = {
  name: string;
  type: string;
  status: '' | VerificationStatus;
};
