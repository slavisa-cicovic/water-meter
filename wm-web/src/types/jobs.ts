export type JobScheduleType = 'weekly' | 'monthly' | 'yearly';

export type JobScheduleConfig = {
  weekday: number; // 1=Mon ... 7=Sun
  hour: number; // 0-23
  minute: number; // 0-59
};

export type JobDefinition = {
  id: string;
  name: string;
  handlerKey: string;
  scheduleType: JobScheduleType;
  scheduleConfig: JobScheduleConfig;
  enabled: boolean;
  maxAttempts: number;
  backoffSeconds: number;
  nextRunAt?: string;
  lastRunAt?: string;
};

export type JobRun = {
  id: string;
  jobId: string;
  status: 'running' | 'success' | 'failed';
  attempt: number;
  runAt: string;
  finishedAt?: string;
  error?: string;
};

export type JobCreateInput = Omit<JobDefinition, 'id' | 'nextRunAt' | 'lastRunAt'>;

export type JobUpdateInput = Partial<JobCreateInput> & {
  id: string;
};
