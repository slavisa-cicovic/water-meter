import { BillingRepository } from 'src/repositories/billingRepository';

const REVIEW_FLAG_MAP = {
  invalid_reading: 'non_positive_consumption',
  no_reading: 'no_reading_current_month',
  no_previous_reading: 'no_previous_reading',
  no_household_size: 'invalid_household_size',
} as const;

type ReviewFlagKey = keyof typeof REVIEW_FLAG_MAP;

export const NotificationService = {
  async getSummary() {
    const entries = Object.entries(REVIEW_FLAG_MAP) as Array<[ReviewFlagKey, string]>;
    const counts = await Promise.all(
      entries.map(async ([external, internal]) => ({
        key: external,
        count: await BillingRepository.countInvoicesByReviewFlag(internal, 'draft'),
      }))
    );

    const reviewFlags = counts.reduce((acc, { key, count }) => {
      acc[key] = count;
      return acc;
    }, {} as Record<ReviewFlagKey, number>);

    const draftInvoices = await BillingRepository.countDraftInvoicesWithoutFlags();

    return { success: true, data: { reviewFlags, draftInvoices } };
  },
};
