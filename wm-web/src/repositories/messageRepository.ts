import prisma from 'src/utils/prisma';

type AccountSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type MessageRow = {
  id: string;
  body: string;
  senderType: 'mobile' | 'web' | 'ai';
  status: 'received' | 'processing' | 'ai_replied' | 'needs_human' | 'human_replied' | 'closed' | null;
  aiError: string | null;
  senderAccountId: string | null;
  createdAt: Date;
  readAtMobile: Date | null;
  readAtWeb: Date | null;
  senderAccount?: { id: string; firstName: string; lastName: string } | null;
};

const selectAccount = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
};

export const MessageRepository = {
  async findThreadByAccount(accountId: string) {
    return prisma.messageThread.findFirst({
      where: { accountId },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async createThread(accountId: string) {
    return prisma.messageThread.create({
      data: { accountId },
    });
  },

  async touchThread(threadId: string, at: Date) {
    return prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: at, archivedAt: null },
    });
  },

  async getOrCreateThread(accountId: string) {
    const existing = await this.findThreadByAccount(accountId);
    if (existing) {
      if (existing.archivedAt) {
        await prisma.messageThread.update({
          where: { id: existing.id },
          data: { archivedAt: null },
        });
      }
      return existing;
    }
    return this.createThread(accountId);
  },

  async listThreads() {
    return prisma.messageThread.findMany({
      where: { archivedAt: null },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
      include: {
        account: { select: selectAccount },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            body: true,
            senderType: true,
            senderAccountId: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });
  },

  async listMessages(threadId: string, limit: number, before?: Date) {
    return prisma.message.findMany({
      where: {
        threadId,
        archivedAt: null,
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        senderAccount: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }) as Promise<MessageRow[]>;
  },

  async listMessagesBySender(
    threadId: string,
    senderType: 'mobile' | 'web' | 'ai',
    limit: number,
    since?: Date
  ) {
    return prisma.message.findMany({
      where: {
        threadId,
        senderType,
        archivedAt: null,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        senderAccount: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }) as Promise<MessageRow[]>;
  },

  async createMessage(
    threadId: string,
    data: {
      body: string;
      senderType: 'mobile' | 'web' | 'ai';
      status?: MessageRow['status'];
      aiError?: MessageRow['aiError'];
      senderAccountId?: string | null;
      readAtMobile?: Date | null;
      readAtWeb?: Date | null;
    }
  ) {
    return prisma.message.create({
      data: {
        threadId,
        body: data.body,
        senderType: data.senderType,
        status: data.status ?? undefined,
        aiError: data.aiError ?? undefined,
        senderAccountId: data.senderAccountId ?? undefined,
        readAtMobile: data.readAtMobile ?? undefined,
        readAtWeb: data.readAtWeb ?? undefined,
      },
    });
  },

  async countUnreadForWeb() {
    return prisma.message.count({
      where: {
        senderType: 'mobile',
        readAtWeb: null,
        archivedAt: null,
        OR: [{ status: null }, { status: 'needs_human' }],
      },
    });
  },

  async countUnreadForWebThread(threadId: string) {
    return prisma.message.count({
      where: {
        threadId,
        senderType: 'mobile',
        readAtWeb: null,
        archivedAt: null,
        OR: [{ status: null }, { status: 'needs_human' }],
      },
    });
  },

  async countUnreadForMobile(threadId: string, since?: Date) {
    return prisma.message.count({
      where: {
        threadId,
        senderType: { in: ['web', 'ai'] },
        readAtMobile: null,
        archivedAt: null,
        ...(since ? { createdAt: { gte: since } } : {}),
      },
    });
  },

  async groupUnreadForWebThreads(threadIds: string[]) {
    if (!threadIds.length) return new Map<string, number>();
    const counts = await prisma.message.groupBy({
      by: ['threadId'],
      where: {
        threadId: { in: threadIds },
        senderType: 'mobile',
        readAtWeb: null,
        archivedAt: null,
        OR: [{ status: null }, { status: 'needs_human' }],
      },
      _count: { _all: true },
    });
    return new Map(counts.map((entry) => [entry.threadId, entry._count._all]));
  },

  async markThreadReadForWeb(threadId: string, at: Date) {
    await prisma.message.updateMany({
      where: {
        threadId,
        senderType: 'mobile',
        readAtWeb: null,
        archivedAt: null,
        OR: [{ status: null }, { status: 'needs_human' }],
      },
      data: { readAtWeb: at },
    });
  },

  async markThreadReadForMobile(threadId: string, at: Date) {
    await prisma.message.updateMany({
      where: { threadId, senderType: { in: ['web', 'ai'] }, readAtMobile: null, archivedAt: null },
      data: { readAtMobile: at },
    });
  },

  async updateMessageStatus(messageId: string, status: MessageRow['status']) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status: status ?? undefined },
    });
  },

  async updateMessageAiError(messageId: string, aiError: MessageRow['aiError']) {
    return prisma.message.update({
      where: { id: messageId },
      data: { aiError: aiError ?? undefined },
    });
  },

  async markLatestMobileMessageReplied(threadId: string) {
    const latest = await prisma.message.findFirst({
      where: {
        threadId,
        senderType: 'mobile',
        archivedAt: null,
        OR: [{ status: null }, { status: 'needs_human' }],
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) return null;
    return prisma.message.update({
      where: { id: latest.id },
      data: { status: 'human_replied' },
    });
  },

  async listRecentMessages(threadId: string, limit: number) {
    return prisma.message.findMany({
      where: { threadId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        senderAccount: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    }) as Promise<MessageRow[]>;
  },

  async findAccount(accountId: string): Promise<AccountSummary | null> {
    return prisma.account.findUnique({
      where: { id: accountId },
      select: selectAccount,
    });
  },
};
