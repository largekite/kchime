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
      mode: 'replies' | 'evaluate' | 'explain' | 'work-reply' | 'continue-conversation' | 'generate-scenario' | 'fix-message' | 'ai-converse';
      prompt?: string;
      context?: string;
      openingLine?: string;
      userReply?: string;
      text?: string;
      message?: string;
      preset?: string;
      scenarioContext?: string;
      history?: { speaker: 'other' | 'user' | 'ai'; text: string }[];
      conversation?: string;
      draft?: string;
      messageType?: string;
      relationship?: string;
      persona?: string;
      userMessage?: string;
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

    if (mode === 'continue-conversation') {
      const { scenarioContext, history } = body;
      if (!scenarioContext || !history) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const historyText = history.map((h) => `${h.speaker === 'other' ? 'Other person' : 'Learner'}: "${h.text}"`).join('\n');

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: `You are simulating a natural American English conversation partner. Given the conversation history, generate a short, realistic follow-up line that the OTHER person would naturally say next. Keep it under 20 words, casual and authentic. Return ONLY valid JSON: {"followUp":"..."}. No markdown.`,
        messages: [
          {
            role: 'user',
            content: `Scenario: ${scenarioContext}\n\nConversation so far:\n${historyText}\n\nWhat does the other person say next?`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ followUp: string }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'generate-scenario') {
      const { conversation } = body;
      if (!conversation) return NextResponse.json({ error: 'Missing conversation' }, { status: 400 });

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are creating English conversation practice scenarios. Given a real conversation snippet, extract the key conversational moment and create a practice scenario. Return ONLY valid JSON with NO markdown:
{"title":"short title under 6 words","category":"one of: Small Talk|Weekend Plans|Workplace Banter|Sports Talk|American Humor|Holiday Greetings|Food & Dining|Social Events|Compliments","openingLine":"the first thing the other person said, as a single sentence","context":"brief description of the situation, 1 sentence","suggestedReplies":["4 natural reply options, each under 20 words"]}`,
        messages: [
          {
            role: 'user',
            content: `Create a practice scenario from this conversation:\n\n"${conversation}"`,
          },
        ],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{
        title: string;
        category: string;
        openingLine: string;
        context: string;
        suggestedReplies: string[];
      }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'fix-message') {
      const { draft, messageType, relationship } = body;
      if (!draft) return NextResponse.json({ error: 'Missing draft' }, { status: 400 });

      const ctx = [messageType && `Message type: ${messageType}`, relationship && `Relationship: ${relationship}`]
        .filter(Boolean).join('. ');

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are an American English writing coach helping non-native speakers sound natural and professional. Given a draft message, rewrite it in 3 ways: Polished (clean and professional), Friendly (warm and approachable), and Confident (direct and assertive). For each, list 2-3 short bullet improvements. Return ONLY valid JSON, no markdown:
{"fixes":[{"tone":"Polished","text":"...","improvements":["...","..."]},{"tone":"Friendly","text":"...","improvements":["...","..."]},{"tone":"Confident","text":"...","improvements":["...","..."]}]}`,
        messages: [{
          role: 'user',
          content: `Draft: "${draft}"\n${ctx ? `\nContext: ${ctx}` : ''}\n\nRewrite in 3 tones.`,
        }],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ fixes: { tone: string; text: string; improvements: string[] }[] }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'ai-converse') {
      const { persona, history, userMessage } = body;
      if (!persona || !history || !userMessage) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const historyText = history.map((h) => `${h.speaker === 'ai' ? persona : 'Learner'}: "${h.text}"`).join('\n');

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 128,
        system: `You are roleplaying as a ${persona} in a realistic American English conversation. Respond naturally and briefly (under 25 words). Keep the conversation moving forward naturally. Return ONLY valid JSON: {"aiReply":"..."}. No markdown.`,
        messages: [{
          role: 'user',
          content: `Conversation so far:\n${historyText}\nLearner: "${userMessage}"\n\nWhat does the ${persona} say next?`,
        }],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ aiReply: string }>(raw);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
