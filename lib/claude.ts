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
