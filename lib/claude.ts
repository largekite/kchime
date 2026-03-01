import type { Context, EvaluationResult, PhraseExplanation, Reply, Tone, WorkplacePreset, WorkReplyResult, WorkReplyVariation } from '@/types';

const TONES: Tone[] = ['Casual', 'Funny', 'Warm', 'Safe'];

export async function fetchReplies(prompt: string, context: Context): Promise<Reply[]> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'replies', prompt, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
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
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'evaluate', openingLine, userReply }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<EvaluationResult>;
}

export async function explainPhrases(text: string): Promise<PhraseExplanation[]> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'explain', text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json() as { phrases: PhraseExplanation[] };
  return data.phrases;
}

const STRATEGY_LABELS = ['A', 'B', 'C'];

export async function fetchWorkReplies(message: string, preset: WorkplacePreset): Promise<WorkReplyResult> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'work-reply', message, preset }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
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
