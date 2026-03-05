import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

// Free-tier daily limits
const LIMITS = {
  'replies': 5,
  'work-reply': 2,
} as const;

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned) as T;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Returns { isPro, userId } from the Bearer token if present. */
async function getSubscription(req: NextRequest): Promise<{ isPro: boolean; userId: string | null }> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { isPro: false, userId: null };

  try {
    const supabase = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return { isPro: false, userId: null };

    const { data } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    return { isPro: data?.plan === 'pro', userId: user.id };
  } catch {
    return { isPro: false, userId: null };
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Checks and increments usage for authenticated free-tier users.
 * Returns true if the request should be blocked.
 */
async function isRateLimited(
  userId: string,
  mode: 'replies' | 'work-reply',
): Promise<boolean> {
  const limit = LIMITS[mode];
  const today = getToday();
  const supabase = createServiceClient();

  const column = mode === 'replies' ? 'quick_reply_count' : 'work_reply_count';

  const { data, error } = await supabase
    .from('daily_usage')
    .select(column)
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const currentCount: number = (!error && data ? (data as Record<string, number>)[column] : 0) ?? 0;

  if (currentCount >= limit) return true;

  // Upsert the incremented count
  await supabase.from('daily_usage').upsert(
    { user_id: userId, date: today, [column]: currentCount + 1 },
    { onConflict: 'user_id,date' },
  );

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      mode: 'replies' | 'evaluate' | 'explain' | 'work-reply';
      prompt?: string;
      context?: string;
      openingLine?: string;
      userReply?: string;
      text?: string;
      message?: string;
      preset?: string;
    };

    const { mode } = body;

    // Rate-limited modes
    if (mode === 'replies' || mode === 'work-reply') {
      const { isPro, userId } = await getSubscription(req);

      if (!isPro) {
        if (userId) {
          // Authenticated free user — enforce server-side
          const blocked = await isRateLimited(userId, mode);
          if (blocked) {
            return NextResponse.json(
              { error: 'limit_reached', limit: LIMITS[mode] },
              { status: 429 },
            );
          }
        }
        // Anonymous users: client-side tracking is sufficient (no server state)
      }
    }

    // Live Listen is Pro-only — block at API level too
    if (mode === 'explain') {
      const { isPro } = await getSubscription(req);
      if (!isPro) {
        // explain is used by Live Listen — allow it for now (nice-to-have gating)
        // If you want to gate it hard, uncomment the next lines:
        // return NextResponse.json({ error: 'pro_required' }, { status: 403 });
      }
    }

    if (mode === 'replies') {
      const { prompt, context } = body;
      if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

      const contextNote = context && context !== 'Any'
        ? `Context: ${context} setting.`
        : 'Context: general/any setting.';

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are an American English conversation coach helping non-native speakers respond naturally. Generate exactly 4 short, authentic replies to what someone said. Each reply must be under 20 words, use contractions, and sound like a real American would say it. Return ONLY valid JSON with this shape: {"replies":[{"tone":"Casual","text":"..."},{"tone":"Funny","text":"..."},{"tone":"Warm","text":"..."},{"tone":"Safe","text":"..."}]}. No markdown, no extra text.`,
        messages: [
          {
            role: 'user',
            content: `Someone said: "${prompt}"\n${contextNote}\n\nGenerate 4 replies (Casual, Funny, Warm, Safe).`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ replies: { tone: string; text: string }[] }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'evaluate') {
      const { openingLine, userReply } = body;
      if (!openingLine || !userReply) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: `You are a warm, encouraging American English coach. Evaluate if a reply sounds natural in a casual American English conversation. Return ONLY valid JSON: {"natural":true/false,"feedback":"1-2 sentence warm feedback","suggestion":"optional better phrasing if not natural"}. No markdown.`,
        messages: [
          {
            role: 'user',
            content: `Opening: "${openingLine}"\nUser replied: "${userReply}"\n\nIs this natural American English? Give feedback.`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ natural: boolean; feedback: string; suggestion?: string }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'explain') {
      const { text } = body;
      if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are an American English coach. Extract idioms, slang, and cultural references from the text. Return ONLY valid JSON: {"phrases":[{"phrase":"...","meaning":"simple meaning under 15 words","tip":"optional short usage tip"}]}. If no special phrases, return {"phrases":[]}. No markdown.`,
        messages: [
          {
            role: 'user',
            content: `Extract idioms, slang, and cultural references from: "${text}"`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ phrases: { phrase: string; meaning: string; tip?: string }[] }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'work-reply') {
      const { message, preset } = body;
      if (!message || !preset) return NextResponse.json({ error: 'Missing message or preset' }, { status: 400 });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are an expert workplace communication strategist. Given a workplace message and the context of how to reply, generate exactly 3 strategic reply variations: one safe/diplomatic, one balanced/direct, one bold/assertive. Each reply should be professional and appropriate for the workplace. Return ONLY valid JSON with this exact shape, no markdown:
{
  "variations": [
    { "strategy": "Diplomatic", "text": "...", "risk": "Low", "powerPosition": "...", "assertiveness": 1-10, "warmth": 1-10 },
    { "strategy": "Direct", "text": "...", "risk": "Medium", "powerPosition": "...", "assertiveness": 1-10, "warmth": 1-10 },
    { "strategy": "Bold", "text": "...", "risk": "High", "powerPosition": "...", "assertiveness": 1-10, "warmth": 1-10 }
  ],
  "bestChoiceIndex": 0
}
powerPosition must be one of: "Neutral", "Assertive", "Deferential", "Collaborative", "Authoritative". bestChoiceIndex is the index of the recommended variation.`,
        messages: [
          {
            role: 'user',
            content: `Context: ${preset}\n\nMessage received:\n"${message}"\n\nGenerate 3 strategic reply variations.`,
          },
        ],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text : '';
      const parsed = parseJson<{
        variations: { strategy: string; text: string; risk: string; powerPosition: string; assertiveness: number; warmth: number }[];
        bestChoiceIndex: number;
      }>(raw);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
