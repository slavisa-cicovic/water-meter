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

type ProcessingResult = {
  status: MessageStatus;
  aiMessage?: MessageItem;
  error?: string;
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
      ...faqMessages,
      ...ordered.map((item) => ({
        role: toPromptRole(item.senderType),
        content: redactPII(item.body),
      })),
      { role: 'user', content: redactPII(body) },
    ];

    const provider = getLlmProvider();
    const result = await provider.generateReply({ messages: promptMessages, userId: accountId });

    if (!result.reply || shouldEscalateFromReply(result.reply)) {
      await MessageRepository.updateMessageStatus(messageId, 'needs_human');
      console.info('[AiMessaging] escalation', {
        threadId,
        messageId,
        reason: result.error || 'no_reply',
      });
      return { status: 'needs_human', error: result.error };
    }

    const now = new Date();
    const aiMessageRow = await MessageRepository.createMessage(threadId, {
      body: result.reply,
      senderType: 'ai',
      status: 'ai_replied',
      readAtWeb: now,
      readAtMobile: null,
    });
    await MessageRepository.updateMessageStatus(messageId, 'ai_replied');
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
