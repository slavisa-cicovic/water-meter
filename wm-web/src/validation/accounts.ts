import {
  AccountUpdateInput,
  ConsumerRegistrationInput,
  StaffRegistrationInput,
  StaffRole,
  ValidationResult,
  VerificationAction,
  VerificationStatus,
} from 'src/types/accounts';

const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+()\-\s]{6,}$/;

const isBlank = (value: string | undefined | null): boolean => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) {
    errors[field] = [];
  }
  errors[field].push(message);
};

const validateName = (value: string, field: string, errors: Record<string, string[]>) => {
  if (isBlank(value)) {
    pushError(errors, field, 'Required');
  } else if (value.trim().length < MIN_NAME_LENGTH) {
    pushError(errors, field, `Must be at least ${MIN_NAME_LENGTH} characters`);
  }
};

const validateEmail = (email: string, errors: Record<string, string[]>) => {
  if (isBlank(email)) {
    pushError(errors, 'email', 'Required');
  } else if (!emailPattern.test(email.trim())) {
    pushError(errors, 'email', 'Invalid email');
  }
};

const validatePhone = (phone: string | undefined, errors: Record<string, string[]>) => {
  if (!phone) {
    return;
  }
  if (!phonePattern.test(phone.trim())) {
    pushError(errors, 'phone', 'Invalid phone');
  }
};

const validateAddress = (address: string, errors: Record<string, string[]>) => {
  if (isBlank(address)) {
    pushError(errors, 'address', 'Required');
  }
};

const validatePassword = (password: string, errors: Record<string, string[]>) => {
  if (isBlank(password)) {
    pushError(errors, 'password', 'Required');
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    pushError(errors, 'password', `Must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
};

const validateHouseholdSize = (householdSize: number, errors: Record<string, string[]>) => {
  if (!Number.isInteger(householdSize) || householdSize < 1) {
    pushError(errors, 'householdSize', 'Must be a whole number greater than 0');
  }
};

const validateStaffRole = (role: StaffRole, errors: Record<string, string[]>) => {
  const allowed: StaffRole[] = ['field', 'backoffice'];
  if (!allowed.includes(role)) {
    pushError(errors, 'staffRole', 'Invalid staff role');
  }
};

const validateVerificationStatus = (status: VerificationStatus, errors: Record<string, string[]>) => {
  const allowed: VerificationStatus[] = ['pending', 'verified', 'rejected'];
  if (!allowed.includes(status)) {
    pushError(errors, 'verificationStatus', 'Invalid verification status');
  }
};

export const validateConsumerRegistration = (input: ConsumerRegistrationInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  validateName(input.firstName, 'firstName', errors);
  validateName(input.lastName, 'lastName', errors);
  validateAddress(input.address, errors);
  validateHouseholdSize(input.householdSize, errors);
  validateEmail(input.email, errors);
  validatePhone(input.phone, errors);
  validatePassword(input.password, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateStaffRegistration = (input: StaffRegistrationInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  validateName(input.firstName, 'firstName', errors);
  validateName(input.lastName, 'lastName', errors);
  validateAddress(input.address, errors);
  validateEmail(input.email, errors);
  validatePhone(input.phone, errors);
  validatePassword(input.password, errors);
  validateStaffRole(input.staffRole, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateVerificationAction = (action: VerificationAction): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(action.accountId)) {
    pushError(errors, 'accountId', 'Required');
  }

  if (isBlank(action.reviewerId)) {
    pushError(errors, 'reviewerId', 'Required');
  }

  if (!action.status) {
    pushError(errors, 'status', 'Required');
  } else {
    validateVerificationStatus(action.status, errors);
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateAccountUpdate = (input: AccountUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  validateName(input.firstName, 'firstName', errors);
  validateName(input.lastName, 'lastName', errors);
  validateAddress(input.address, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};
