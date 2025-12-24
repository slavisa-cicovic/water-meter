import prisma from 'src/utils/prisma';
import { JobCreateInput, JobDefinition, JobScheduleConfig, JobScheduleType, JobUpdateInput } from 'src/types/jobs';

type ValidationResult = { valid: boolean; errors: Record<string, string[]> };

const isBlank = (value: string | undefined | null) => !value || !value.trim();

const pushError = (errors: Record<string, string[]>, field: string, message: string) => {
  if (!errors[field]) errors[field] = [];
  errors[field].push(message);
};

const validateScheduleConfig = (config: JobScheduleConfig, errors: Record<string, string[]>) => {
  if (!config) {
    pushError(errors, 'scheduleConfig', 'Required');
    return;
  }

  if (config.weekday < 1 || config.weekday > 7) pushError(errors, 'weekday', 'Must be 1-7');
  if (config.hour < 0 || config.hour > 23) pushError(errors, 'hour', 'Must be 0-23');
  if (config.minute < 0 || config.minute > 59) pushError(errors, 'minute', 'Must be 0-59');
};

export const validateJobInput = (input: JobCreateInput): ValidationResult => {
  const errors: Record<string, string[]> = {};

  if (isBlank(input.name)) pushError(errors, 'name', 'Required');
  if (isBlank(input.handlerKey)) pushError(errors, 'handlerKey', 'Required');
  if (!input.scheduleType) pushError(errors, 'scheduleType', 'Required');
  validateScheduleConfig(input.scheduleConfig, errors);

  if (input.maxAttempts < 1) pushError(errors, 'maxAttempts', 'Must be >= 1');
  if (input.backoffSeconds < 0) pushError(errors, 'backoffSeconds', 'Must be >= 0');

  return { valid: Object.keys(errors).length === 0, errors };
};

const toJobDefinition = (row: any): JobDefinition => ({
  id: row.id,
  name: row.name,
  handlerKey: row.handlerKey,
  scheduleType: row.scheduleType,
  scheduleConfig: row.scheduleConfig as JobScheduleConfig,
  enabled: row.enabled,
  maxAttempts: row.maxAttempts,
  backoffSeconds: row.backoffSeconds,
  nextRunAt: row.nextRunAt?.toISOString?.() ?? row.nextRunAt ?? undefined,
  lastRunAt: row.lastRunAt?.toISOString?.() ?? row.lastRunAt ?? undefined,
});

const getTargetDow = (weekday: number) => (weekday === 7 ? 0 : weekday);

const getFirstWeekdayOfMonth = (year: number, month: number, weekday: number) => {
  const date = new Date(year, month, 1);
  const targetDow = getTargetDow(weekday);
  const diff = (targetDow - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
};

const getFirstWeekdayOfYear = (year: number, weekday: number) => {
  const date = new Date(year, 0, 1);
  const targetDow = getTargetDow(weekday);
  const diff = (targetDow - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
};

export const computeNextRunAt = (
  scheduleType: JobScheduleType,
  scheduleConfig: JobScheduleConfig,
  fromDate = new Date()
) => {
  const { weekday, hour, minute } = scheduleConfig;
  const now = new Date(fromDate);

  if (scheduleType === 'weekly') {
    const targetDow = getTargetDow(weekday);
    const currentDow = now.getDay();
    let diff = (targetDow - currentDow + 7) % 7;
    const candidate = new Date(now);
    candidate.setHours(hour, minute, 0, 0);
    if (diff === 0 && candidate <= now) diff = 7;
    candidate.setDate(candidate.getDate() + diff);
    return candidate;
  }

  if (scheduleType === 'monthly') {
    let year = now.getFullYear();
    let month = now.getMonth();
    let candidate = getFirstWeekdayOfMonth(year, month, weekday);
    candidate.setHours(hour, minute, 0, 0);
    if (candidate <= now) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      candidate = getFirstWeekdayOfMonth(year, month, weekday);
      candidate.setHours(hour, minute, 0, 0);
    }
    return candidate;
  }

  let year = now.getFullYear();
  let candidate = getFirstWeekdayOfYear(year, weekday);
  candidate.setHours(hour, minute, 0, 0);
  if (candidate <= now) {
    year += 1;
    candidate = getFirstWeekdayOfYear(year, weekday);
    candidate.setHours(hour, minute, 0, 0);
  }
  return candidate;
};

export const JobsService = {
  async list() {
    const jobs = await prisma.jobDefinition.findMany({ orderBy: { createdAt: 'asc' } });
    return { success: true, data: { jobs: jobs.map(toJobDefinition) } };
  },

  async findById(id: string) {
    const job = await prisma.jobDefinition.findUnique({ where: { id } });
    if (!job) return { success: false, error: 'NOT_FOUND' };
    return { success: true, data: { job: toJobDefinition(job) } };
  },

  async create(input: JobCreateInput) {
    const validation = validateJobInput(input);
    if (!validation.valid) {
      return { success: false, error: 'VALIDATION_FAILED', details: validation.errors };
    }

    const nextRunAt = computeNextRunAt(input.scheduleType, input.scheduleConfig);
    const job = await prisma.jobDefinition.create({
      data: {
        name: input.name,
        handlerKey: input.handlerKey,
        scheduleType: input.scheduleType,
        scheduleConfig: input.scheduleConfig as any,
        enabled: input.enabled,
        maxAttempts: input.maxAttempts,
        backoffSeconds: input.backoffSeconds,
        nextRunAt,
      },
    });

    return { success: true, data: { job: toJobDefinition(job) } };
  },

  async update(input: JobUpdateInput) {
    const existing = await prisma.jobDefinition.findUnique({ where: { id: input.id } });
    if (!existing) return { success: false, error: 'NOT_FOUND' };

    const scheduleType = (input.scheduleType ?? existing.scheduleType) as JobScheduleType;
    const scheduleConfig = (input.scheduleConfig ?? existing.scheduleConfig) as JobScheduleConfig;
    const nextRunAt = computeNextRunAt(scheduleType, scheduleConfig);

    const job = await prisma.jobDefinition.update({
      where: { id: input.id },
      data: {
        name: input.name ?? existing.name,
        handlerKey: input.handlerKey ?? existing.handlerKey,
        scheduleType,
        scheduleConfig: scheduleConfig as any,
        enabled: input.enabled ?? existing.enabled,
        maxAttempts: input.maxAttempts ?? existing.maxAttempts,
        backoffSeconds: input.backoffSeconds ?? existing.backoffSeconds,
        nextRunAt,
      },
    });

    return { success: true, data: { job: toJobDefinition(job) } };
  },
};
