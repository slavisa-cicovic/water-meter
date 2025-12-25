import prisma from 'src/utils/prisma';
import { JobDefinition } from 'src/types/jobs';
import { computeNextRunAt } from 'src/services/jobsService';
import { jobHandlers } from 'src/services/job-handlers';

const POLL_INTERVAL_MS = 30_000;
const LOCK_TTL_MS = 5 * 60 * 1000;

const getInstanceId = () => {
  const host = process.env.HOSTNAME;
  if (host) return host;
  return `instance-${Math.random().toString(36).slice(2, 10)}`;
};

const INSTANCE_ID = getInstanceId();

type SchedulerState = {
  started: boolean;
  intervalId?: NodeJS.Timeout;
};

const globalState = global as unknown as { jobScheduler?: SchedulerState };

const acquireLock = async (jobId: string, now: Date) => {
  const lockUntil = new Date(now.getTime() + LOCK_TTL_MS);
  const result = await prisma.jobDefinition.updateMany({
    where: {
      id: jobId,
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
    },
    data: {
      lockedUntil: lockUntil,
      lockedBy: INSTANCE_ID,
    },
  });
  return result.count === 1;
};

const releaseLock = async (jobId: string) => {
  await prisma.jobDefinition.update({
    where: { id: jobId },
    data: { lockedUntil: null, lockedBy: null },
  });
};

const createJobRun = async (jobId: string, attempt: number) =>
  prisma.jobRun.create({
    data: {
      jobId,
      status: 'running',
      attempt,
    },
  });

const finishJobRun = async (
  runId: string,
  status: 'success' | 'failed',
  error?: string,
  resultSummary?: Record<string, any>
) =>
  prisma.jobRun.update({
    where: { id: runId },
    data: {
      status,
      error: error ?? null,
      finishedAt: new Date(),
      ...(resultSummary ? { resultSummary } : {}),
    },
  });

const executeJob = async (
  job: JobDefinition,
  options?: { initiatorId?: string; payload?: Record<string, any> }
) => {
  const handler = jobHandlers[job.handlerKey];
  
  if (!handler) {
    const run = await createJobRun(job.id, 1);
    await finishJobRun(run.id, 'failed', `Unknown handler: ${job.handlerKey}`);
    return;
  }

  for (let attempt = 1; attempt <= job.maxAttempts; attempt += 1) {
    const run = await createJobRun(job.id, attempt);
    try {
      const result = await handler({
        job,
        runId: run.id,
        attempt,
        initiatorId: options?.initiatorId,
        payload: options?.payload,
      });
      await finishJobRun(run.id, 'success', undefined, result?.resultSummary);
      return;
    } catch (error: any) {
      await finishJobRun(run.id, 'failed', error?.message ?? 'Job failed');
      if (attempt < job.maxAttempts && job.backoffSeconds > 0) {
        await new Promise((resolve) => setTimeout(resolve, job.backoffSeconds * 1000));
      }
    }
  }
};

export const runJobNow = async (
  jobId: string,
  options?: { initiatorId?: string; payload?: Record<string, any> }
) => {
  const jobRow = await prisma.jobDefinition.findUnique({ where: { id: jobId } });
  if (!jobRow || jobRow.deletedAt) return { success: false, error: 'NOT_FOUND' };

  const now = new Date();
  const acquired = await acquireLock(jobId, now);
  if (!acquired) return { success: false, error: 'LOCKED' };

  try {
    const job = {
      id: jobRow.id,
      name: jobRow.name,
      handlerKey: jobRow.handlerKey,
      scheduleType: jobRow.scheduleType,
      scheduleConfig: jobRow.scheduleConfig as any,
      enabled: jobRow.enabled,
      maxAttempts: jobRow.maxAttempts,
      backoffSeconds: jobRow.backoffSeconds,
      nextRunAt: jobRow.nextRunAt?.toISOString?.() ?? undefined,
      lastRunAt: jobRow.lastRunAt?.toISOString?.() ?? undefined,
    } as JobDefinition;

    await executeJob(job, options);
    const nextRunAt = computeNextRunAt(job.scheduleType, job.scheduleConfig);
    await prisma.jobDefinition.update({
      where: { id: jobId },
      data: { nextRunAt, lastRunAt: new Date() },
    });
    return { success: true };
  } finally {
    await releaseLock(jobId);
  }
};

const pollJobs = async () => {
  const now = new Date();
  const dueJobs = await prisma.jobDefinition.findMany({
    where: {
      enabled: true,
      deletedAt: null,
      nextRunAt: { lte: now },
    },
    orderBy: { nextRunAt: 'asc' },
    take: 10,
  });

  for (const jobRow of dueJobs) {
    const acquired = await acquireLock(jobRow.id, now);
    if (!acquired) continue;

    try {
      const job = {
        id: jobRow.id,
        name: jobRow.name,
        handlerKey: jobRow.handlerKey,
        scheduleType: jobRow.scheduleType,
        scheduleConfig: jobRow.scheduleConfig as any,
        enabled: jobRow.enabled,
        maxAttempts: jobRow.maxAttempts,
        backoffSeconds: jobRow.backoffSeconds,
        nextRunAt: jobRow.nextRunAt?.toISOString?.() ?? undefined,
        lastRunAt: jobRow.lastRunAt?.toISOString?.() ?? undefined,
      } as JobDefinition;

      await executeJob(job);
      const nextRunAt = computeNextRunAt(job.scheduleType, job.scheduleConfig);
      await prisma.jobDefinition.update({
        where: { id: job.id },
        data: { nextRunAt, lastRunAt: new Date() },
      });
    } finally {
      await releaseLock(jobRow.id);
    }
  }
};

export const startJobScheduler = () => {
  if (typeof window !== 'undefined') return;
  if (process.env.NEXT_RUNTIME === 'edge') return;
  
  if (!globalState.jobScheduler) {
    globalState.jobScheduler = { started: false };
  }
  
  if (globalState.jobScheduler.started) return;
  
  const intervalId = setInterval(() => {
    pollJobs().catch((error) => {
      console.error('[JobScheduler] poll failed', error);
    });
  }, POLL_INTERVAL_MS);

  globalState.jobScheduler = { started: true, intervalId };
};

startJobScheduler();
