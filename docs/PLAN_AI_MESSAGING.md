# Plan – AI Messaging (Mobile Users)

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Introduce AI assistant as first-line support for mobile users.
- Provide safe, auditable messaging (PII redaction, moderation, logging).
- Enable escalation to human support when confidence is low or topic is sensitive.
- Preserve conversation history to improve quality and operations.

## Tasks
1. `[ ]` Define domain model for conversations and messages (Conversation, Message, SenderType, Status, EscalationState).
2. `[ ]` Define API contract for mobile chat: `POST /api/ai/messages`, `GET /api/ai/conversations/:id`, `GET /api/ai/conversations`.
3. `[ ]` Implement `services/aiMessagingService.ts` (LLM orchestration, context, retries, timeouts).
4. `[ ]` Add LLM provider adapter (OpenAI now, self-hosted later) with config flag and a stable interface.
5. `[ ]` Add `types/aiMessaging.ts` and `validation/aiMessaging.ts` (input/output, sanitization).
6. `[ ]` Add persistence layer (DB tables: conversations, messages, escalation_events).
7. `[ ]` RAG/memory: index FAQ/rules (start with curated static set) and wire retrieval.
8. `[ ]` Guardrails: PII redaction before model call + content moderation before responding to user.
9. `[ ]` Escalation: define rules (low confidence, specific intents) and handoff workflow to human support queue.
10. `[ ]` Admin UI (web): basic conversation list and escalation status (read-only to start).
11. `[ ]` Mobile UI: minimal chat screen under `src/screens/...` with statuses (AI reply, waiting, escalated).
12. `[ ]` Observability: logging, tracing, and metrics (latency, deflection rate, escalation rate).
13. `[ ]` QA: test flows (normal, low confidence, escalation, rate-limit).

## Notes
- Always return `{ success, data?, error? }` for AI API responses.
- AI service must use only whitelisted context; never send raw PII.
- JWT token must be included on every request (web + mobile).
- v1 can ship with FAQ-only retrieval if full RAG is not required yet.
- Message visibility while AI is processing is a product decision; keep it configurable (hidden vs. placeholder state).

## Message state machine (draft)
- `received` -> message accepted from mobile, persisted, not yet processed.
- `processing` -> AI is handling the message.
- `ai_replied` -> AI response sent to user, no human needed.
- `needs_human` -> AI failed or low confidence; message awaits web user.
- `human_replied` -> web user responded.
- `closed` -> conversation closed (optional for v1).

Allowed transitions:
- `received` -> `processing`
- `processing` -> `ai_replied` | `needs_human`
- `needs_human` -> `human_replied`
- `ai_replied` | `human_replied` -> `closed`

## API flow (draft)
1. Mobile sends message to `POST /api/ai/messages`.
2. Backend creates `Message` with `received`, then moves to `processing`.
3. AI provider adapter handles the prompt with guardrails + context.
4. If AI can answer: store AI reply, set status `ai_replied`, return response to mobile.
5. If AI cannot answer or low confidence: set status `needs_human`, return fallback response to mobile and surface to web user queue.
6. Web user replies through admin UI; backend stores reply and updates status `human_replied`.
7. Optional: close conversation with `closed` when resolved.
