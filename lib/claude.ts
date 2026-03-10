import type { Context, EvaluationResult, PhraseExplanation, Reply, Tone, WorkplacePreset, WorkReplyResult, WorkReplyVariation } from '@/types';
import { createClient } from '@/lib/supabase';

const TONES: Tone[] = ['Casual', 'Funny', 'Warm', 'Safe'];

/** Re-throw timeout errors with a user-friendly message. */
function wrapTimeout(err: unknown): never {
  if (err instanceof DOMException && err.name === 'TimeoutError') {
    throw new Error('Request timed out — please try again.');
  }
  throw err;
}

/** Special error thrown when the free-tier daily limit is reached. */
export class LimitReachedError extends Error {
  constructor(public readonly limit: number) {
    super('limit_reached');
    this.name = 'LimitReachedError';
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // ignore
  }
  return {};
}

const REQUEST_TIMEOUT_MS = 30_000;

async function post(body: Record<string, unknown>): Promise<Response> {
  const authHeader = await getAuthHeader();
  return fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export interface ReplyPersonalization {
  toneProfile?: { formality: number; lengthPreference: string; emojiEnabled: boolean; customInstructions?: string };
  relationshipProfile?: { name: string; formality: number; warmth: number; brevity: number; directness: number; emojiAllowed: boolean };
  contactNotes?: string;
}

export async function fetchReplies(prompt: string, context: Context, personalization?: ReplyPersonalization): Promise<Reply[]> {
  const res = await post({ mode: 'replies', prompt, context, ...personalization }).catch(wrapTimeout);

  if (res.status === 429) {
    const err = await res.json().catch(() => ({ limit: 5 })) as { limit?: number };
    throw new LimitReachedError(err.limit ?? 5);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json() as { replies: { tone: string; text: string }[] };
  return data.replies.map((r, i) => ({
    id: `reply-${Date.now()}-${i}`,
    tone: (r.tone as Tone) ?? TONES[i],
    text: r.text,
  }));
}

export async function* fetchRepliesStream(prompt: string, context: Context, personalization?: ReplyPersonalization): AsyncGenerator<Reply> {
  const authHeader = await getAuthHeader();
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ mode: 'replies-stream', prompt, context, ...personalization }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  }).catch(wrapTimeout);

  if (res.status === 429) {
    const err = await res.json().catch(() => ({ limit: 5 })) as { limit?: number };
    throw new LimitReachedError(err.limit ?? 5);
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let index = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed) as { tone: string; text: string };
          yield {
            id: `reply-${Date.now()}-${index++}`,
            tone: (parsed.tone as Tone) ?? TONES[index - 1],
            text: parsed.text,
          };
        } catch {
          // skip malformed lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function evaluateResponse(openingLine: string, userReply: string): Promise<EvaluationResult> {
  const res = await post({ mode: 'evaluate', openingLine, userReply }).catch(wrapTimeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<EvaluationResult>;
}

export async function explainPhrases(text: string): Promise<PhraseExplanation[]> {
  const res = await post({ mode: 'explain', text }).catch(wrapTimeout);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json() as { phrases: PhraseExplanation[] };
  return data.phrases;
}

export async function continueConversation(
  scenarioContext: string,
  history: { speaker: 'other' | 'user'; text: string }[],
): Promise<string> {
  const res = await post({ mode: 'continue-conversation', scenarioContext, history }).catch(wrapTimeout);
  if (!res.ok) throw new Error('Failed to continue conversation');
  const data = await res.json() as { followUp: string };
  return data.followUp;
}

export async function generateScenario(conversation: string): Promise<{
  title: string;
  category: string;
  openingLine: string;
  context: string;
  suggestedReplies: string[];
}> {
  const res = await post({ mode: 'generate-scenario', conversation }).catch(wrapTimeout);
  if (!res.ok) throw new Error('Failed to generate scenario');
  return res.json();
}

export interface MessageFix {
  tone: string;
  text: string;
  improvements: string[];
}

export async function fixMessage(
  draft: string,
  messageType: string,
  relationship: string,
  personalization?: ReplyPersonalization,
): Promise<MessageFix[]> {
  const res = await post({ mode: 'fix-message', draft, messageType, relationship, ...personalization }).catch(wrapTimeout);
  if (res.status === 429) {
    const err = await res.json().catch(() => ({ limit: 3 })) as { limit?: number };
    throw new LimitReachedError(err.limit ?? 3);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  const data = await res.json() as { fixes: MessageFix[] };
  return data.fixes;
}

export async function converseDebrief(
  persona: string,
  history: { speaker: 'ai' | 'user'; text: string }[],
): Promise<{ highlight: string; tip: string; fluency: 'Excellent' | 'Good' | 'Keep practicing' }> {
  const res = await post({ mode: 'converse-debrief', persona, history }).catch(wrapTimeout);
  if (!res.ok) throw new Error('Failed to get debrief');
  return res.json();
}

export async function aiConverse(
  persona: string,
  history: { speaker: 'ai' | 'user'; text: string }[],
  userMessage: string,
): Promise<string> {
  const res = await post({ mode: 'ai-converse', persona, history, userMessage }).catch(wrapTimeout);
  if (!res.ok) throw new Error('Failed to get AI response');
  const data = await res.json() as { aiReply: string };
  return data.aiReply;
}

export async function fetchPackVariations(prompt: string, personalization?: ReplyPersonalization): Promise<{ tone: string; text: string }[]> {
  const res = await post({ mode: 'pack-variations', prompt, ...personalization });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }
  const data = await res.json() as { variations: { tone: string; text: string }[] };
  return data.variations;
}

const STRATEGY_LABELS = ['A', 'B', 'C'];

export async function fetchWorkReplies(message: string, preset: WorkplacePreset, personalization?: ReplyPersonalization): Promise<WorkReplyResult> {
  const res = await post({ mode: 'work-reply', message, preset, ...personalization });

  if (res.status === 429) {
    const err = await res.json().catch(() => ({ limit: 2 })) as { limit?: number };
    throw new LimitReachedError(err.limit ?? 2);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json() as {
    variations: Omit<WorkReplyVariation, 'id' | 'label'>[];
    bestChoiceIndex: number;
  };

  const variations: WorkReplyVariation[] = data.variations.map((v, i) => ({
    ...v,
    id: `work-${Date.now()}-${i}`,
    label: `Option ${STRATEGY_LABELS[i]} — ${v.strategy}`,
  }));

  return { variations, bestChoiceIndex: data.bestChoiceIndex };
}
