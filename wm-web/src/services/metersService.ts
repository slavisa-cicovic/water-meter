import { AccountRepository } from 'src/repositories/accountRepository';
import { MeterRepository } from 'src/repositories/meterRepository';
import { Meter, MeterConsumerLinkInput, MeterCreateInput, MeterListParams, MeterUpdateInput } from 'src/types/meters';
import { validateMeterCreate, validateMeterUpdate } from 'src/validation/meters';

const toMeter = (row: any): Meter => ({
  id: row.id,
  serialNumber: row.serialNumber,
  barcode: row.barcode ?? undefined,
  groupCode: row.groupCode ?? undefined,
  address: row.address,
  status: row.status,
  type: row.type,
  consumersCount: Array.isArray(row.consumers) ? row.consumers.length : undefined,
  consumers: Array.isArray(row.consumers)
    ? row.consumers
        .map((link: any) => link.account)
        .filter(Boolean)
        .map((account: any) => ({
          id: account.id,
          firstName: account.firstName,
          lastName: account.lastName,
          address: account.address,
        }))
    : undefined,
  needsBarcodeReview: Array.isArray(row.readings) ? row.readings.length > 0 : undefined,
  installedAt: row.installedAt?.toISOString?.() ?? row.installedAt ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.createdAt?.toISOString?.() ?? row.createdAt ?? undefined,
  updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt ?? undefined,
});

export const MetersService = {
  async create(input: MeterCreateInput) {
    const validation = validateMeterCreate(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const meter = await MeterRepository.create(input);
      return { success: true, data: { meter: toMeter(meter) } };
    } catch (error: any) {
      if (error.code === 'P2002') return { success: false, error: 'METER_EXISTS' };
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async update(input: MeterUpdateInput) {
    const validation = validateMeterUpdate(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    try {
      const meter = await MeterRepository.update(input);
      return { success: true, data: { meter: toMeter(meter) } };
    } catch (error: any) {
      if (error.code === 'P2025') return { success: false, error: 'NOT_FOUND' };
      if (error.code === 'P2002') return { success: false, error: 'METER_EXISTS' };
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async delete(id: string) {
    if (!id) return { success: false, error: 'VALIDATION_FAILED', details: { id: ['Required'] } };

    try {
      await MeterRepository.softDelete(id);
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') return { success: false, error: 'NOT_FOUND' };
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async findById(id: string) {
    if (!id) return { success: false, error: 'VALIDATION_FAILED', details: { id: ['Required'] } };
    const meter = await MeterRepository.findById(id);
    if (!meter) return { success: false, error: 'NOT_FOUND' };
    return { success: true, data: { meter: toMeter(meter) } };
  },

  async list(params: MeterListParams = {}) {
    const { meters, total } = await MeterRepository.list(params);
    return { success: true, data: { meters: meters.map(toMeter), total } };
  },

  async addConsumerLink(input: MeterConsumerLinkInput) {
    const errors: Record<string, string[]> = {};
    if (!input.meterId) errors.meterId = ['Required'];
    if (!input.accountId) errors.accountId = ['Required'];
    if (Object.keys(errors).length) return { success: false, error: 'VALIDATION_FAILED', details: errors };

    const account = await AccountRepository.findById(input.accountId);
    if (!account) return { success: false, error: 'ACCOUNT_NOT_FOUND' };
    const accountRoles = account.accountRoleLinks?.map((link) => link.role?.slug).filter(Boolean) ?? [];
    if (!accountRoles.includes('consumer')) return { success: false, error: 'CONSUMER_ONLY' };

    try {
      await MeterRepository.addConsumerLink(input.meterId, input.accountId);
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2002') return { success: true }; // idempotent
      if (error.code === 'P2003') return { success: false, error: 'NOT_FOUND' };
      return { success: false, error: 'SERVER_ERROR' };
    }
  },

  async removeConsumerLink(input: MeterConsumerLinkInput) {
    const errors: Record<string, string[]> = {};
    if (!input.meterId) errors.meterId = ['Required'];
    if (!input.accountId) errors.accountId = ['Required'];
    if (Object.keys(errors).length) return { success: false, error: 'VALIDATION_FAILED', details: errors };

    try {
      await MeterRepository.removeConsumerLink(input.meterId, input.accountId);
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') return { success: false, error: 'NOT_FOUND' };
      return { success: false, error: 'SERVER_ERROR' };
    }
  },
};
