import { JobDefinition } from 'src/types/jobs';
import { BillingService } from 'src/services/billingService';

export type JobHandlerContext = {
  job: JobDefinition;
  runId: string;
  attempt: number;
  initiatorId?: string;
  payload?: Record<string, any>;
};

export type JobHandler = (context: JobHandlerContext) => Promise<void>;

export const jobHandlerOptions = [
  { key: 'billing_generate', label: 'Generate invoices' },
  { key: 'photo_ocr_process', label: 'Process photo OCR readings' },
];

export const jobHandlers: Record<string, JobHandler> = {
  async billing_generate({ job, runId, attempt, initiatorId, payload }) {
    console.info('[JobHandler] billing_generate', { jobId: job.id, runId, attempt });
    const mode = payload?.mode === 'manual' ? 'manual' : 'auto';
    await BillingService.generateDraftsFromReadings(new Date(), {
      mode,
      overrideIssued: Boolean(payload?.overrideIssued),
      overridePaid: Boolean(payload?.overridePaid),
      adminId: initiatorId,
      jobRunId: runId,
    });
  },
  async photo_ocr_process({ job, runId, attempt }) {
    console.info('[JobHandler] photo_ocr_process', { jobId: job.id, runId, attempt });
  },
};
