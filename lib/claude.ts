import type { Context, EvaluationResult, PhraseExplanation, Reply, Tone, WorkplacePreset, WorkReplyResult, WorkReplyVariation } from '@/types';
import { createClient } from '@/lib/supabase';

const TONES: Tone[] = ['Casual', 'Funny', 'Warm', 'Safe'];

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

async function post(body: Record<string, unknown>): Promise<Response> {
  const authHeader = await getAuthHeader();
  return fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify(body),
  });
}

export async function fetchReplies(prompt: string, context: Context): Promise<Reply[]> {
  const res = await post({ mode: 'replies', prompt, context });

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

export async function evaluateResponse(openingLine: string, userReply: string): Promise<EvaluationResult> {
  const res = await post({ mode: 'evaluate', openingLine, userReply });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' })) as { error?: string };
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<EvaluationResult>;
}

export async function explainPhrases(text: string): Promise<PhraseExplanation[]> {
  const res = await post({ mode: 'explain', text });

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
  const res = await post({ mode: 'continue-conversation', scenarioContext, history });
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
  const res = await post({ mode: 'generate-scenario', conversation });
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
): Promise<MessageFix[]> {
  const res = await post({ mode: 'fix-message', draft, messageType, relationship });
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
  const res = await post({ mode: 'converse-debrief', persona, history });
  if (!res.ok) throw new Error('Failed to get debrief');
  return res.json();
}

export async function aiConverse(
  persona: string,
  history: { speaker: 'ai' | 'user'; text: string }[],
  userMessage: string,
): Promise<string> {
  const res = await post({ mode: 'ai-converse', persona, history, userMessage });
  if (!res.ok) throw new Error('Failed to get AI response');
  const data = await res.json() as { aiReply: string };
  return data.aiReply;
}

const STRATEGY_LABELS = ['A', 'B', 'C'];

export async function fetchWorkReplies(message: string, preset: WorkplacePreset): Promise<WorkReplyResult> {
  const res = await post({ mode: 'work-reply', message, preset });

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
