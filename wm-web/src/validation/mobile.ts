import { MobileProfileUpdateInput } from "src/types/mobile";
import { ValidationResult } from "src/types/accounts";

const MIN_NAME_LENGTH = 2;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value: string | undefined | null): boolean => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) {
    errors[field] = [];
  }
  errors[field].push(message);
};

const validateName = (value: string, field: string, errors: Record<string, string[]>) => {
  if (isBlank(value)) {
    pushError(errors, field, "Required");
  } else if (value.trim().length < MIN_NAME_LENGTH) {
    pushError(errors, field, `Must be at least ${MIN_NAME_LENGTH} characters`);
  }
};

const validateEmail = (email: string, errors: Record<string, string[]>) => {
  if (isBlank(email)) {
    pushError(errors, "email", "Required");
  } else if (!emailPattern.test(email.trim())) {
    pushError(errors, "email", "Invalid email");
  }
};

export const validateMobileProfileUpdate = (input: MobileProfileUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  validateName(input.firstName, "firstName", errors);
  validateName(input.lastName, "lastName", errors);
  validateEmail(input.email, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};
