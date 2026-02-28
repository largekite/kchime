import type { Context, EvaluationResult, PhraseExplanation, Reply, Tone } from '@/types';

const TONES: Tone[] = ['Casual', 'Funny', 'Warm', 'Safe'];

export async function fetchReplies(
  prompt: string,
  context: Context,
  apiKey: string
): Promise<Reply[]> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'replies', prompt, context, apiKey }),
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

export async function evaluateResponse(
  openingLine: string,
  userReply: string,
  apiKey: string
): Promise<EvaluationResult> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'evaluate', openingLine, userReply, apiKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<EvaluationResult>;
}

export async function explainPhrases(
  text: string,
  apiKey: string
): Promise<PhraseExplanation[]> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'explain', text, apiKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed: ${res.status}`);
  }

  const data = await res.json() as { phrases: PhraseExplanation[] };
  return data.phrases;
}
