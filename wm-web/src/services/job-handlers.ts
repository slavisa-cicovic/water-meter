import { JobDefinition } from 'src/types/jobs';
import { BillingService } from 'src/services/billingService';

export type JobHandlerContext = {
  job: JobDefinition;
  runId: string;
  attempt: number;
};

export type JobHandler = (context: JobHandlerContext) => Promise<void>;

export const jobHandlerOptions = [
  { key: 'billing_generate', label: 'Generate invoices' },
  { key: 'photo_ocr_process', label: 'Process photo OCR readings' },
];

export const jobHandlers: Record<string, JobHandler> = {
  async billing_generate({ job, runId, attempt }) {
    console.info('[JobHandler] billing_generate', { jobId: job.id, runId, attempt });
    await BillingService.generateDraftsFromReadings();
  },
  async photo_ocr_process({ job, runId, attempt }) {
    console.info('[JobHandler] photo_ocr_process', { jobId: job.id, runId, attempt });
  },
};
