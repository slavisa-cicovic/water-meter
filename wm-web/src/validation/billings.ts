import {
  InvoiceCreateInput,
  InvoiceStatus,
  TariffCreateInput,
  TariffUpdateInput,
  TariffStatus,
  ValidationResult,
} from 'src/types/billings';

const isBlank = (value: string | undefined | null): boolean => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
};

const validateDate = (value: string | undefined | null, field: string, errors: Record<string, string[]>) => {
  if (isBlank(value)) {
    pushError(errors, field, 'Required');
    return;
  }
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) pushError(errors, field, 'Invalid date');
};

const validateStatus = (status: InvoiceStatus | undefined, errors: Record<string, string[]>) => {
  if (!status) return;
  const allowed: InvoiceStatus[] = ['draft', 'confirmed', 'issued', 'paid', 'void'];
  if (!allowed.includes(status)) pushError(errors, 'status', 'Invalid status');
};

const validateTariffStatus = (status: TariffStatus | undefined, errors: Record<string, string[]>) => {
  if (!status) return;
  const allowed: TariffStatus[] = ['active', 'inactive'];
  if (!allowed.includes(status)) pushError(errors, 'status', 'Invalid status');
};

const validateNonNegative = (value: number | undefined, field: string, errors: Record<string, string[]>) => {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value < 0) pushError(errors, field, 'Must be a non-negative number');
};

const validatePositiveInt = (value: number | undefined, field: string, errors: Record<string, string[]>) => {
  if (value === undefined) return;
  if (!Number.isInteger(value) || value < 0) pushError(errors, field, 'Must be a non-negative integer');
};

export const validateTariffCreate = (input: TariffCreateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.name)) pushError(errors, 'name', 'Required');
  validateNonNegative(input.basePrice, 'basePrice', errors);
  validatePositiveInt(input.greenLimit, 'greenLimit', errors);
  validatePositiveInt(input.blueLimit, 'blueLimit', errors);
  validateNonNegative(input.blueMultiplier, 'blueMultiplier', errors);
  validateNonNegative(input.redMultiplier, 'redMultiplier', errors);
  validateDate(input.validFrom, 'validFrom', errors);
  if (input.validTo) validateDate(input.validTo, 'validTo', errors);
  validateTariffStatus(input.status, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateTariffUpdate = (input: TariffUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.id)) pushError(errors, 'id', 'Required');
  if (input.basePrice !== undefined) validateNonNegative(input.basePrice, 'basePrice', errors);
  if (input.greenLimit !== undefined) validatePositiveInt(input.greenLimit, 'greenLimit', errors);
  if (input.blueLimit !== undefined) validatePositiveInt(input.blueLimit, 'blueLimit', errors);
  if (input.blueMultiplier !== undefined) validateNonNegative(input.blueMultiplier, 'blueMultiplier', errors);
  if (input.redMultiplier !== undefined) validateNonNegative(input.redMultiplier, 'redMultiplier', errors);
  if (input.validFrom !== undefined) validateDate(input.validFrom, 'validFrom', errors);
  if (input.validTo !== undefined && input.validTo !== null) validateDate(input.validTo, 'validTo', errors);
  validateTariffStatus(input.status, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateInvoiceCreate = (input: InvoiceCreateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.accountId)) pushError(errors, 'accountId', 'Required');
  validateDate(input.periodStart, 'periodStart', errors);
  validateDate(input.periodEnd, 'periodEnd', errors);
  if (input.vatRate !== undefined) validateNonNegative(input.vatRate, 'vatRate', errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export { validateStatus };
