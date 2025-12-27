export type VerificationStatus = "pending" | "verified" | "rejected";

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  address: string;
  householdSize: number;
  email: string;
  phone?: string;
  password: string;
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
