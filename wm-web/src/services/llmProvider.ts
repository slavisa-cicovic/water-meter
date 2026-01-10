import { AI_PROVIDER, LOCAL_LLM_URL, OPENAI_API_KEY, OPENAI_MODEL } from 'src/config-global';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlmReply = {
  reply: string | null;
  shouldEscalate?: boolean;
  error?: string;
};

export type LlmProvider = {
  generateReply: (input: { messages: ChatMessage[]; userId?: string; timeoutMs?: number }) => Promise<LlmReply>;
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const getProviderKey = () => AI_PROVIDER.toLowerCase();

class NoopProvider implements LlmProvider {
  async generateReply(): Promise<LlmReply> {
    return { reply: null, shouldEscalate: true, error: 'PROVIDER_NOT_CONFIGURED' };
  }
}

class OpenAiProvider implements LlmProvider {
  constructor(private apiKey: string, private model: string) {}

  async generateReply({
    messages,
    userId,
    timeoutMs = 8000,
  }: {
    messages: ChatMessage[];
    userId?: string;
    timeoutMs?: number;
  }): Promise<LlmReply> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
          user: userId,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        return { reply: null, shouldEscalate: true, error: `OPENAI_${res.status}` };
      }
      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content?.trim() || null;
      return { reply: content, shouldEscalate: !content };
    } catch (error) {
      return { reply: null, shouldEscalate: true, error: error instanceof Error ? error.message : 'OPENAI_ERROR' };
    } finally {
      clearTimeout(timeout);
    }
  }
}

class LocalLlmProvider implements LlmProvider {
  constructor(private model: string) {}

  async generateReply({
    messages,
    timeoutMs = 8000,
  }: {
    messages: ChatMessage[];
    userId?: string;
    timeoutMs?: number;
  }): Promise<LlmReply> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(LOCAL_LLM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        return { reply: null, shouldEscalate: true, error: `LOCAL_LLM_${res.status}` };
      }
      const payload = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content?.trim() || null;
      return { reply: content, shouldEscalate: !content };
    } catch (error) {
      return { reply: null, shouldEscalate: true, error: error instanceof Error ? error.message : 'LOCAL_LLM_ERROR' };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const getLlmProvider = (): LlmProvider => {
  const providerKey = getProviderKey();
  if (providerKey === 'openai') {
    if (!OPENAI_API_KEY) {
      return new NoopProvider();
    }
    return new OpenAiProvider(OPENAI_API_KEY, OPENAI_MODEL);
  }
  if (providerKey === 'local' || providerKey === 'self_hosted') {
    return new LocalLlmProvider(OPENAI_MODEL);
  }
  return new NoopProvider();
};
