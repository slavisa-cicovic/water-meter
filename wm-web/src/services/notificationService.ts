import { BillingRepository } from 'src/repositories/billingRepository';
import { MessageRepository } from 'src/repositories/messageRepository';

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

    const [draftInvoices, unreadMessages, outOfScopeMessages] = await Promise.all([
      BillingRepository.countDraftInvoicesWithoutFlags(),
      MessageRepository.countUnreadForWeb(),
      MessageRepository.countOutOfScopeForWeb(),
    ]);

    return { success: true, data: { reviewFlags, draftInvoices, unreadMessages, outOfScopeMessages } };
  },
};
