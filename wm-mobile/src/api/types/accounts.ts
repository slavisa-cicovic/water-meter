export type VerificationStatus = "pending" | "verified" | "rejected";

export type StaffRole = "field" | "backoffice";

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

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
};

export type RegistrationResult = {
  id: string;
  verificationStatus: VerificationStatus;
};
