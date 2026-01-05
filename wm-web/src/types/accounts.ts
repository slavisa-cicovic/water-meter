export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type AccountRole = 'admin' | 'consumer' | 'staff_field' | 'staff_backoffice';

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
  role: 'consumer';
  householdSize: number;
  avatar?: never;
};

export type StaffAccount = BaseAccount & {
  role: 'admin' | 'staff_field' | 'staff_backoffice';
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
  verificationStatus: VerificationStatus;
  permissionsVersion: number;
  issuedAt: string;
};

type BaseAccountRow = {
  id: string;
  type: AccountRole;
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
  type: 'consumer';
  avatar?: never;
};

export type NonConsumerAccountRow = BaseAccountRow & {
  type: Exclude<AccountRole, 'consumer'>;
  avatar?: string;
};

export type AccountRow = ConsumerAccountRow | NonConsumerAccountRow;

export type IAccountTableFilterValue = string;

export type IAccountTableFilters = {
  name: string;
  type: '' | 'consumer' | 'staff' | 'admin' | 'staff_backoffice' | 'staff_field';
  status: '' | VerificationStatus;
};
