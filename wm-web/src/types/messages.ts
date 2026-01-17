export type MessageSenderType = 'mobile' | 'web' | 'ai';

export type MessageStatus =
  | 'received'
  | 'processing'
  | 'ai_replied'
  | 'needs_human'
  | 'human_replied'
  | 'closed';

export type MessageItem = {
  id: string;
  body: string;
  senderType: MessageSenderType;
  status: MessageStatus | null;
  aiError: string | null;
  aiOutOfScope: boolean;
  senderAccountId: string | null;
  senderName: string | null;
  createdAt: string;
  readAtMobile: string | null;
  readAtWeb: string | null;
};

export type MessageThreadSummary = {
  threadId: string;
  account: { id: string; firstName: string; lastName: string; email: string; type: string; aiEnabled: boolean };
  lastMessage: { body: string; senderType: MessageSenderType; createdAt: string } | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type MessageThreadDetail = {
  threadId: string | null;
  account: { id: string; firstName: string; lastName: string; email: string; type: string; aiEnabled: boolean } | null;
  messages: MessageItem[];
  unreadCount: number;
};
