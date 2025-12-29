import { JobDefinition } from 'src/types/jobs';
import { BillingService } from 'src/services/billingService';
import { SettingsService } from 'src/services/settingsService';

export type JobHandlerContext = {
  job: JobDefinition;
  runId: string;
  attempt: number;
  initiatorId?: string;
  payload?: Record<string, any>;
};

export type JobHandlerResult = {
  resultSummary?: Record<string, any>;
};

export type JobHandler = (context: JobHandlerContext) => Promise<JobHandlerResult | void>;

export const jobHandlerOptions = [
  { key: 'billing_generate', label: 'Generate invoices' },
  { key: 'billing_issue', label: 'Issue invoices' },
  { key: 'photo_ocr_process', label: 'Process photo OCR readings' },
];

export const jobHandlers: Record<string, JobHandler> = {
  async billing_generate({ job, runId, attempt, initiatorId, payload }) {
    console.info('[JobHandler] billing_generate', { jobId: job.id, runId, attempt });
    const mode = payload?.mode === 'manual' ? 'manual' : 'auto';
    const effectiveDateResult = await SettingsService.getEffectiveDate();
    const effectiveDate = effectiveDateResult.success ? effectiveDateResult.data : new Date();
    const result = await BillingService.generateDraftsFromReadings(effectiveDate, {
      mode,
      overrideIssued: Boolean(payload?.overrideIssued),
      overridePaid: Boolean(payload?.overridePaid),
      adminId: initiatorId,
      jobRunId: runId,
    });
    const created = (result as any)?.data?.invoices?.length || 0;
    const skipped = (result as any)?.data?.skipped?.length || 0;
    return {
      resultSummary: {
        totalInvoices: created + skipped,
        createdInvoices: created,
        skippedInvoices: skipped,
      },
    };
  },
  async billing_issue({ job, runId, attempt }) {
    console.info('[JobHandler] billing_issue', { jobId: job.id, runId, attempt });
    const result = await BillingService.issueConfirmedInvoices();
    const updated = (result as any)?.data?.updated || 0;
    const eligible = (result as any)?.data?.eligible || updated;
    return {
      resultSummary: {
        eligibleInvoices: eligible,
        issuedInvoices: updated,
      },
    };
  },
  async photo_ocr_process({ job, runId, attempt }) {
    console.info('[JobHandler] photo_ocr_process', { jobId: job.id, runId, attempt });
  },
};
