import { MeterCreateInput, MeterStatus, MeterUpdateInput, ValidationResult } from 'src/types/meters';

const groupCodePattern = /^(0[1-9]|[1-9][0-9])$/;

const isBlank = (value: string | undefined | null): boolean => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
};

const validateGroupCode = (groupCode: string | null | undefined, errors: Record<string, string[]>) => {
  if (groupCode == null) return;
  if (isBlank(groupCode)) {
    pushError(errors, 'groupCode', 'Must be null or a 2-digit code (01-99)');
    return;
  }
  if (!groupCodePattern.test(groupCode.trim())) {
    pushError(errors, 'groupCode', 'Must match 01-99');
  }
};

const validateMeterStatus = (status: MeterStatus | undefined, errors: Record<string, string[]>) => {
  if (!status) return;
  const allowed: MeterStatus[] = ['active', 'inactive', 'removed'];
  if (!allowed.includes(status)) pushError(errors, 'status', 'Invalid status');
};

const validateIsoDate = (value: string | null | undefined, field: string, errors: Record<string, string[]>) => {
  if (value == null) return;
  if (isBlank(value)) {
    pushError(errors, field, 'Must be null or a valid ISO date string');
    return;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) pushError(errors, field, 'Invalid date');
};

export const validateMeterCreate = (input: MeterCreateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.serialNumber)) pushError(errors, 'serialNumber', 'Required');
  if (isBlank(input.address)) pushError(errors, 'address', 'Required');

  validateGroupCode(input.groupCode, errors);
  validateMeterStatus(input.status, errors);
  validateIsoDate(input.installedAt, 'installedAt', errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateMeterUpdate = (input: MeterUpdateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.id)) pushError(errors, 'id', 'Required');
  if (input.serialNumber !== undefined && isBlank(input.serialNumber)) pushError(errors, 'serialNumber', 'Must not be blank');
  if (input.address !== undefined && isBlank(input.address)) pushError(errors, 'address', 'Must not be blank');

  validateGroupCode(input.groupCode, errors);
  validateMeterStatus(input.status, errors);
  validateIsoDate(input.installedAt, 'installedAt', errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

