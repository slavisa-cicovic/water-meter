import { AiFaqRepository } from 'src/repositories/aiFaqRepository';
import { MessageRepository } from 'src/repositories/messageRepository';
import { MessageItem, MessageStatus } from 'src/types/messages';
import { ChatMessage, getLlmProvider } from 'src/services/llmProvider';
import { SettingsService } from 'src/services/settingsService';

const CONTEXT_LIMIT = 8;
const EMAIL_REDACT_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const EMAIL_TEST_REGEX = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_REDACT_REGEX = /(\+?\d[\d\s().-]{6,}\d)/g;
const PHONE_TEST_REGEX = /(\+?\d[\d\s().-]{6,}\d)/;
const FAQ_SNIPPETS: string[] = [];

const redactPII = (value: string) =>
  value.replace(EMAIL_REDACT_REGEX, '[redacted-email]').replace(PHONE_REDACT_REGEX, '[redacted-phone]');

const containsPII = (value: string) => EMAIL_TEST_REGEX.test(value) || PHONE_TEST_REGEX.test(value);

const toPromptRole = (senderType: MessageItem['senderType']): ChatMessage['role'] =>
  senderType === 'mobile' ? 'user' : 'assistant';

const shouldEscalateFromReply = (reply: string) =>
  /i\s+don'?t\s+know|not\s+sure|cannot\s+help|can't\s+help/i.test(reply) || containsPII(reply);

const defaultSystemPrompt = [
  'You are a support assistant for a municipal water meter app.',
  'Answer briefly and clearly.',
  'If you are unsure, ask for clarification or escalate.',
  'Never request or reveal sensitive personal data.',
].join(' ');

const buildSystemPrompt = (override?: string | null) => (override && override.trim() ? override.trim() : defaultSystemPrompt);

const formatFaqEntries = (entries: Array<{ question: string; answer: string }>) =>
  entries.map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`);

const buildFaqContext = (entries: string[]) =>
  entries.length ? `Reference notes:\n- ${entries.join('\n- ')}` : '';

const buildOutputFormatPrompt = () =>
  [
    'Output format (must be valid JSON, no extra text):',
    '{',
    '"reply": "<short reply to the user in the same language>",',
    '"shouldEscalate": true|false,',
    '"outOfScope": true|false,',
    '"reason": "<one of: out_of_scope, sensitive_data, billing_dispute, legal, account_change, meter_correction, complaint, low_confidence, other>"',
    '}',
    'Set outOfScope=true if the user asks about anything not related to the water meter app or municipal water services.',
    'If shouldEscalate=true, reply must be a short escalation message.',
  ].join('\n');

const parseAiJson = (raw: string) => {
  const trimmed = raw.trim();
  const tryParse = (value: string) => {
    try {
      return JSON.parse(value) as {
        reply?: string;
        shouldEscalate?: boolean;
        outOfScope?: boolean;
        reason?: string;
      };
    } catch {
      return null;
    }
  };
  const direct = tryParse(trimmed);
  if (direct) return direct;
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return tryParse(trimmed.slice(start, end + 1));
  }
  return null;
};

type ProcessingResult = {
  status: MessageStatus;
  aiMessage?: MessageItem;
  error?: string;
};

const truncateError = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > 500 ? `${trimmed.slice(0, 500)}...` : trimmed;
};

export const AiMessagingService = {
  async processMobileMessage({
    threadId,
    messageId,
    accountId,
    body,
    toMessageItem,
  }: {
    threadId: string;
    messageId: string;
    accountId: string;
    body: string;
    toMessageItem: (row: {
      id: string;
      body: string;
      senderType: MessageItem['senderType'];
      senderAccountId: string | null;
      createdAt: Date;
      readAtMobile: Date | null;
      readAtWeb: Date | null;
      status: MessageStatus | null;
      senderAccount?: { id: string; firstName: string; lastName: string } | null;
    }) => MessageItem;
  }): Promise<ProcessingResult> {
    await MessageRepository.updateMessageStatus(messageId, 'processing');

    const history = await MessageRepository.listRecentMessages(threadId, CONTEXT_LIMIT);
    const ordered = history
      .filter((item) => item.id !== messageId)
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const dbFaq = await AiFaqRepository.listActive();
    const faqSnippets = [...FAQ_SNIPPETS, ...formatFaqEntries(dbFaq)];
    const faqContext = buildFaqContext(faqSnippets);
    const promptSetting = await SettingsService.getAiSystemPrompt();
    const systemPrompt = buildSystemPrompt(promptSetting.success ? promptSetting.data : null);
    const faqMessages: ChatMessage[] = faqContext ? [{ role: 'system', content: faqContext }] : [];
    const promptMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: buildOutputFormatPrompt() },
      ...faqMessages,
      ...ordered.map((item) => ({
        role: toPromptRole(item.senderType),
        content: redactPII(item.body),
      })),
      { role: 'user', content: redactPII(body) },
    ];

    const provider = getLlmProvider();
    const result = await provider.generateReply({ messages: promptMessages, userId: accountId });

    const parsed = result.reply ? parseAiJson(result.reply) : null;
    const replyText = parsed?.reply?.trim() || (result.reply ? result.reply.trim() : '');
    const shouldEscalate = Boolean(parsed?.shouldEscalate) || shouldEscalateFromReply(replyText);
    const outOfScope = Boolean(parsed?.outOfScope);

    if (!replyText || shouldEscalate || outOfScope) {
      const aiError = truncateError(
        result.error || parsed?.reason || (replyText ? 'ESCALATED_BY_GUARD' : 'NO_REPLY')
      );
      await MessageRepository.updateMessageStatus(messageId, 'needs_human');
      await MessageRepository.updateMessageAiError(messageId, aiError);
      await MessageRepository.updateMessageOutOfScope(messageId, outOfScope);
      console.info('[AiMessaging] escalation', {
        threadId,
        messageId,
        reason: aiError || 'no_reply',
      });
      return { status: 'needs_human', error: result.error };
    }

    const now = new Date();
    const aiMessageRow = await MessageRepository.createMessage(threadId, {
      body: replyText,
      senderType: 'ai',
      status: 'ai_replied',
      readAtWeb: now,
      readAtMobile: null,
    });
    await MessageRepository.updateMessageStatus(messageId, 'ai_replied');
    await MessageRepository.updateMessageAiError(messageId, null);
    await MessageRepository.updateMessageOutOfScope(messageId, false);
    await MessageRepository.touchThread(threadId, now);
    console.info('[AiMessaging] reply sent', { threadId, messageId });

    return {
      status: 'ai_replied',
      aiMessage: toMessageItem({
        ...aiMessageRow,
        senderAccountId: null,
        readAtMobile: aiMessageRow.readAtMobile ?? null,
        readAtWeb: aiMessageRow.readAtWeb ?? now,
        status: 'ai_replied',
      }),
    };
  },
};
