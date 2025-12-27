import { VerificationStatus } from "./accounts";

export type AccountRole = "admin" | "consumer" | "staff_field" | "staff_backoffice";

export type LoginInput = {
  identifier: string;
  password: string;
};

export type LoginUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AccountRole;
  verificationStatus: VerificationStatus;
};

export type LoginResult = {
  accessToken: string;
  user: LoginUser;
};
