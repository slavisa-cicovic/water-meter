import { MessageRepository } from 'src/repositories/messageRepository';
import { AiMessagingService } from 'src/services/aiMessagingService';
import { validateAiMessageInput } from 'src/validation/aiMessaging';

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

const MOBILE_LIMIT_PER_SENDER = 10;
const MOBILE_MESSAGE_WINDOW_DAYS = 10;
const WEB_DEFAULT_LIMIT = 30;

const normalizeBody = (body?: string | null) => (typeof body === 'string' ? body.trim() : '');

const toMessageItem = (row: {
  id: string;
  body: string;
  senderType: 'mobile' | 'web' | 'ai';
  senderAccountId: string | null;
  createdAt: Date;
  readAtMobile: Date | null;
  readAtWeb: Date | null;
  status: 'received' | 'processing' | 'ai_replied' | 'needs_human' | 'human_replied' | 'closed' | null;
  aiError?: string | null;
  senderAccount?: { id: string; firstName: string; lastName: string } | null;
}) => ({
  id: row.id,
  body: row.body,
  senderType: row.senderType,
  status: row.status ?? null,
  aiError: row.aiError ?? null,
  senderAccountId: row.senderAccountId ?? null,
  senderName: row.senderAccount
    ? `${row.senderAccount.firstName} ${row.senderAccount.lastName}`.trim()
    : null,
  createdAt: row.createdAt.toISOString(),
  readAtMobile: row.readAtMobile ? row.readAtMobile.toISOString() : null,
  readAtWeb: row.readAtWeb ? row.readAtWeb.toISOString() : null,
});

export const MessageService = {
  async getMobileThread(accountId: string): Promise<ServiceResult<{
    threadId: string;
    messages: ReturnType<typeof toMessageItem>[];
    unreadCount: number;
  }>> {
    const thread = await MessageRepository.getOrCreateThread(accountId);
    const since = new Date(Date.now() - MOBILE_MESSAGE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [mobileMessages, webMessages, aiMessages, unreadCount] = await Promise.all([
      MessageRepository.listMessagesBySender(thread.id, 'mobile', MOBILE_LIMIT_PER_SENDER, since),
      MessageRepository.listMessagesBySender(thread.id, 'web', MOBILE_LIMIT_PER_SENDER, since),
      MessageRepository.listMessagesBySender(thread.id, 'ai', MOBILE_LIMIT_PER_SENDER, since),
      MessageRepository.countUnreadForMobile(thread.id, since),
    ]);

    const merged = [...mobileMessages, ...webMessages, ...aiMessages]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(toMessageItem);

    if (webMessages.length || aiMessages.length) {
      await MessageRepository.markThreadReadForMobile(thread.id, new Date());
    }

    return { success: true, data: { threadId: thread.id, messages: merged, unreadCount } };
  },

  async createMobileMessage(
    accountId: string,
    body?: string | null,
    options?: { allowAi?: boolean }
  ): Promise<ServiceResult<{
    message: ReturnType<typeof toMessageItem>;
    aiMessage?: ReturnType<typeof toMessageItem>;
  }>> {
    const normalized = normalizeBody(body);
    const validation = validateAiMessageInput({ body: normalized });
    if (!validation.valid) return { success: false, error: 'VALIDATION_FAILED' };

    const thread = await MessageRepository.getOrCreateThread(accountId);
    const now = new Date();
    const allowAi = options?.allowAi ?? true;
    const message = await MessageRepository.createMessage(thread.id, {
      body: normalized,
      senderType: 'mobile',
      senderAccountId: accountId,
      readAtMobile: now,
      readAtWeb: null,
      status: allowAi ? 'processing' : 'needs_human',
    });
    await MessageRepository.touchThread(thread.id, now);

    if (!allowAi) {
      return {
        success: true,
        data: {
          message: toMessageItem({
            ...message,
            senderAccountId: accountId,
            readAtMobile: message.readAtMobile ?? now,
            readAtWeb: message.readAtWeb ?? null,
            status: 'needs_human',
            aiError: null,
          }),
        },
      };
    }

    let aiResult: { status: 'received' | 'processing' | 'ai_replied' | 'needs_human' | 'human_replied' | 'closed'; aiMessage?: ReturnType<typeof toMessageItem> };
    try {
      aiResult = await AiMessagingService.processMobileMessage({
        threadId: thread.id,
        messageId: message.id,
        accountId,
        body: normalized,
        toMessageItem,
      });
    } catch (error) {
      await MessageRepository.updateMessageStatus(message.id, 'needs_human');
      await MessageRepository.updateMessageAiError(
        message.id,
        error instanceof Error ? error.message : 'PROCESSING_FAILED'
      );
      aiResult = { status: 'needs_human' };
      console.error('[AiMessaging] Failed to process message', error);
    }

    return {
      success: true,
      data: {
        message: toMessageItem({
          ...message,
          senderAccountId: accountId,
          readAtMobile: message.readAtMobile ?? now,
          readAtWeb: message.readAtWeb ?? null,
          status: aiResult.status,
          aiError: null,
        }),
        aiMessage: aiResult.aiMessage,
      },
    };
  },

  async listWebThreads(): Promise<ServiceResult<{
    threads: Array<{
      threadId: string;
      account: { id: string; firstName: string; lastName: string; email: string };
      lastMessage: { body: string; senderType: 'mobile' | 'web' | 'ai'; createdAt: string } | null;
      lastMessageAt: string | null;
      unreadCount: number;
    }>;
  }>> {
    const threads = await MessageRepository.listThreadsNeedingHuman();
    const unreadByThread = await MessageRepository.groupUnreadForWebThreads(threads.map((thread) => thread.id));

    const mapped = threads.map((thread) => {
      const last = thread.messages[0] ?? null;
      return {
        threadId: thread.id,
        account: thread.account,
        lastMessage: last
          ? { body: last.body, senderType: last.senderType, createdAt: last.createdAt.toISOString() }
          : null,
        lastMessageAt: thread.lastMessageAt ? thread.lastMessageAt.toISOString() : null,
        unreadCount: unreadByThread.get(thread.id) ?? 0,
      };
    });

    return { success: true, data: { threads: mapped } };
  },

  async getWebThread(accountId: string, options?: { limit?: number; before?: string | null }): Promise<ServiceResult<{
    threadId: string | null;
    account: { id: string; firstName: string; lastName: string; email: string } | null;
    messages: ReturnType<typeof toMessageItem>[];
    unreadCount: number;
  }>> {
    const account = await MessageRepository.findAccount(accountId);
    if (!account) return { success: false, error: 'NOT_FOUND' };

    const thread = await MessageRepository.findThreadByAccount(accountId);
    if (!thread) {
      return { success: true, data: { threadId: null, account, messages: [], unreadCount: 0 } };
    }

    const limit = options?.limit ?? WEB_DEFAULT_LIMIT;
    const candidate = options?.before ? new Date(options.before) : undefined;
    const beforeDate = candidate && !Number.isNaN(candidate.getTime()) ? candidate : undefined;
    const messages = await MessageRepository.listMessages(thread.id, limit, beforeDate);
    const unreadCount = await MessageRepository.countUnreadForWebThread(thread.id);

    if (!beforeDate) {
      await MessageRepository.markThreadReadForWeb(thread.id, new Date());
    }

    return {
      success: true,
      data: {
        threadId: thread.id,
        account,
        messages: messages
          .slice()
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map(toMessageItem),
        unreadCount,
      },
    };
  },

  async createWebMessage(
    accountId: string,
    senderAccountId: string,
    body?: string | null
  ): Promise<ServiceResult<{ message: ReturnType<typeof toMessageItem> }>> {
    const normalized = normalizeBody(body);
    if (!normalized) return { success: false, error: 'VALIDATION_FAILED' };

    const thread = await MessageRepository.getOrCreateThread(accountId);
    const now = new Date();
    const message = await MessageRepository.createMessage(thread.id, {
      body: normalized,
      senderType: 'web',
      senderAccountId,
      readAtWeb: now,
      readAtMobile: null,
      status: 'human_replied',
    });
    await MessageRepository.touchThread(thread.id, now);
    await MessageRepository.markLatestMobileMessageReplied(thread.id);

    return {
      success: true,
      data: {
        message: toMessageItem({
          ...message,
          senderAccountId,
          readAtWeb: message.readAtWeb ?? now,
          readAtMobile: message.readAtMobile ?? null,
        }),
      },
    };
  },
};
