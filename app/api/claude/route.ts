import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

// Use Sonnet for core reply generation, Haiku for simpler supportive tasks
const MODEL_FAST = 'claude-haiku-4-5-20251001';
const MODEL_QUALITY = 'claude-sonnet-4-6';

// Daily limits per tier
const FREE_LIMITS = {
  'replies': 10,
  'work-reply': 3,
} as const;

const PRO_LIMITS = {
  'replies': 50,
  'work-reply': 50,
} as const;

export const dynamic = 'force-dynamic';

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  return JSON.parse(cleaned) as T;
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/** Returns { plan, userId } from the Bearer token if present. */
async function getSubscription(req: NextRequest): Promise<{ plan: 'free' | 'pro' | 'max'; userId: string | null }> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { plan: 'free', userId: null };

  try {
    const supabase = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return { plan: 'free', userId: null };

    const { data } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const p = data?.plan;
    const plan = (p === 'max' || p === 'pro') ? p : 'free';
    return { plan, userId: user.id };
  } catch {
    return { plan: 'free', userId: null };
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Checks and increments usage for authenticated users.
 * Returns true if the request should be blocked.
 */
async function isRateLimited(
  userId: string,
  mode: 'replies' | 'work-reply',
  limit: number,
): Promise<boolean> {
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
      mode: 'replies' | 'replies-stream' | 'evaluate' | 'explain' | 'work-reply' | 'continue-conversation' | 'generate-scenario' | 'fix-message' | 'ai-converse' | 'converse-debrief' | 'daily-phrase' | 'pack-variations';
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
      toneProfile?: { formality: number; lengthPreference: string; emojiEnabled: boolean; customInstructions?: string };
      relationshipProfile?: { name: string; formality: number; warmth: number; brevity: number; directness: number; emojiAllowed: boolean };
      contactNotes?: string;
    };

    const { mode } = body;

    // Rate-limited modes
    if (mode === 'replies' || mode === 'replies-stream' || mode === 'work-reply') {
      const { plan, userId } = await getSubscription(req);

      // Max tier gets unlimited
      if (plan !== 'max') {
        const limits = plan === 'pro' ? PRO_LIMITS : FREE_LIMITS;
        if (userId) {
          const rateLimitMode = mode === 'replies-stream' ? 'replies' : mode as 'replies' | 'work-reply';
          const blocked = await isRateLimited(userId, rateLimitMode, limits[rateLimitMode]);
          if (blocked) {
            return NextResponse.json(
              { error: 'limit_reached', limit: limits[rateLimitMode] },
              { status: 429 },
            );
          }
        }
        // Anonymous users: client-side tracking is sufficient (no server state)
      }
    }

    // Live Listen is Pro-only — block at API level too
    if (mode === 'explain') {
      const { plan } = await getSubscription(req);
      if (plan === 'free') {
        // explain is used by Live Listen — allow it for now (nice-to-have gating)
        // If you want to gate it hard, uncomment the next lines:
        // return NextResponse.json({ error: 'pro_required' }, { status: 403 });
      }
    }

    // Build personalization note from tone profile (shared across modes)
    function buildPersonalizationNote(
      tp?: { formality: number; lengthPreference: string; emojiEnabled: boolean; customInstructions?: string },
      rp?: { name: string; formality: number; warmth: number; brevity: number; directness: number; emojiAllowed: boolean },
      cn?: string,
    ): string {
      const parts: string[] = [];
      if (tp) {
        const formalityDesc = tp.formality < 0.3 ? 'casual' : tp.formality > 0.65 ? 'formal' : 'balanced';
        const lengthDesc = tp.lengthPreference === 'short' ? 'very brief (under 10 words)' : tp.lengthPreference === 'verbose' ? 'detailed (20+ words)' : 'medium length (10-20 words)';
        parts.push(`User prefers ${formalityDesc} tone, ${lengthDesc} replies.`);
        if (tp.emojiEnabled) parts.push('Include emojis where natural.');
        else parts.push('Do NOT include emojis.');
        if (tp.customInstructions) parts.push(`User note: ${tp.customInstructions}`);
      }
      if (rp) {
        parts.push(`Replying to their ${rp.name}. Formality: ${rp.formality}/10, Warmth: ${rp.warmth}/10, Brevity: ${rp.brevity}/10, Directness: ${rp.directness}/10.`);
        if (rp.emojiAllowed) parts.push('Emojis are appropriate for this relationship.');
      }
      if (cn) {
        parts.push(`Notes about the person: ${cn}`);
      }
      return parts.length > 0 ? `\nPersonalization: ${parts.join(' ')}` : '';
    }

    // Context-specific tone sets and rich descriptions
    const CONTEXT_CONFIG: Record<string, { description: string; tones: string[] }> = {
      Any:    { description: 'Context: general/any setting. Reply naturally for any everyday situation.', tones: ['Casual', 'Funny', 'Warm', 'Safe'] },
      Office: { description: 'Context: professional workplace. Keep replies polished, concise, and appropriate for colleagues or a boss. Avoid slang.', tones: ['Professional', 'Diplomatic', 'Confident', 'Friendly'] },
      Text:   { description: 'Context: texting a friend. Replies should feel like real text messages — short, relaxed, maybe abbreviations or slang.', tones: ['Chill', 'Witty', 'Hype', 'Sweet'] },
      Party:  { description: 'Context: social event or party. Replies should be upbeat, energetic, and fun. Match the lively vibe.', tones: ['Playful', 'Bold', 'Energetic', 'Smooth'] },
      Family: { description: 'Context: talking with family members. Replies should be warm, respectful, and caring. Appropriate for parents, siblings, or relatives.', tones: ['Warm', 'Gentle', 'Lighthearted', 'Respectful'] },
    };

    if (mode === 'replies') {
      const { prompt, context, toneProfile, relationshipProfile, contactNotes } = body;
      if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

      const config = CONTEXT_CONFIG[context ?? 'Any'] ?? CONTEXT_CONFIG.Any;
      const contextNote = config.description;
      const toneLabels = config.tones;

      const personalizationNote = buildPersonalizationNote(toneProfile, relationshipProfile, contactNotes);

      const toneJson = toneLabels.map(t => `{"tone":"${t}","text":"..."}`).join(',');
      const toneList = toneLabels.join(', ');

      const message = await getAnthropic().messages.create({
        model: MODEL_QUALITY,
        max_tokens: 512,
        system: `You are an American English conversation coach helping non-native speakers respond naturally. Generate exactly 4 short, authentic replies to what someone said. Each reply must use contractions and sound like a real American would say it. Return ONLY valid JSON with this shape: {"replies":[${toneJson}]}. No markdown, no extra text.${personalizationNote}`,
        messages: [
          {
            role: 'user',
            content: `Someone said: "${prompt}"\n${contextNote}\n\nGenerate 4 replies (${toneList}).`,
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

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
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

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
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
      const { message, preset, relationshipProfile, contactNotes } = body;
      if (!message || !preset) return NextResponse.json({ error: 'Missing message or preset' }, { status: 400 });

      const workPersonalization = buildPersonalizationNote(undefined, relationshipProfile, contactNotes);

      // Preset-specific strategies and context guidance
      const PRESET_CONFIG: Record<string, { context: string; strategies: [string, string, string] }> = {
        'Reply to Manager': {
          context: 'You are replying to your manager or supervisor. Show respect for their authority while still communicating effectively. Be mindful of hierarchy.',
          strategies: ['Respectful', 'Balanced', 'Proactive'],
        },
        'Reply to Direct Report': {
          context: 'You are replying to someone you manage. Be supportive and clear. Guide without micromanaging. Show leadership and approachability.',
          strategies: ['Supportive', 'Clear & Direct', 'Mentoring'],
        },
        'Reply to Client': {
          context: 'You are replying to an external client or customer. Prioritize professionalism, service orientation, and protecting the relationship. Be solution-focused.',
          strategies: ['Service-First', 'Professional', 'Partnership'],
        },
        'Push Back Politely': {
          context: 'You need to decline, disagree, or push back on something while maintaining the relationship. Set boundaries without burning bridges.',
          strategies: ['Gentle Redirect', 'Firm but Fair', 'Counter-Proposal'],
        },
        'Deliver Constructive Feedback': {
          context: 'You need to give constructive criticism or feedback. Be specific, actionable, and kind. Focus on behavior, not the person.',
          strategies: ['Encouraging', 'Straightforward', 'Growth-Focused'],
        },
        'Escalate Issue Professionally': {
          context: 'You need to escalate a problem up the chain or flag a serious concern. Be factual, solution-oriented, and urgent without being alarmist.',
          strategies: ['Measured', 'Fact-Based', 'Urgent & Clear'],
        },
      };

      const config = PRESET_CONFIG[preset] ?? {
        context: `Context: ${preset}`,
        strategies: ['Diplomatic', 'Direct', 'Bold'] as [string, string, string],
      };
      const [s1, s2, s3] = config.strategies;

      const response = await getAnthropic().messages.create({
        model: MODEL_QUALITY,
        max_tokens: 1024,
        system: `You are an expert workplace communication strategist. ${config.context}${workPersonalization}

Generate exactly 3 strategic reply variations with these strategies: "${s1}" (safest), "${s2}" (balanced), "${s3}" (boldest). Each reply should be professional, natural, and appropriate for this specific workplace relationship. Return ONLY valid JSON with this exact shape, no markdown:
{
  "variations": [
    { "strategy": "${s1}", "text": "...", "risk": "Low", "powerPosition": "...", "assertiveness": 1-10, "warmth": 1-10 },
    { "strategy": "${s2}", "text": "...", "risk": "Medium", "powerPosition": "...", "assertiveness": 1-10, "warmth": 1-10 },
    { "strategy": "${s3}", "text": "...", "risk": "High", "powerPosition": "...", "assertiveness": 1-10, "warmth": 1-10 }
  ],
  "bestChoiceIndex": 0
}
powerPosition must be one of: "Neutral", "Assertive", "Deferential", "Collaborative", "Authoritative". bestChoiceIndex is the index of the recommended variation.`,
        messages: [
          {
            role: 'user',
            content: `Workplace scenario: ${preset}\n\nMessage received:\n"${message}"\n\nGenerate 3 strategic reply variations.`,
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

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
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

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
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
      const { draft, messageType, relationship, toneProfile, relationshipProfile, contactNotes } = body;
      if (!draft) return NextResponse.json({ error: 'Missing draft' }, { status: 400 });

      // Message-type-specific tone sets and guidance
      const FIX_TYPE_CONFIG: Record<string, { guidance: string; tones: [string, string, string] }> = {
        'Casual text':    { guidance: 'This is a casual text message. Keep rewrites short, relaxed, and natural — like a real text. Use contractions, maybe abbreviations.', tones: ['Clean', 'Friendly', 'Punchy'] },
        'Work email':     { guidance: 'This is a work email. Rewrites should be professional, clear, and well-structured. Use proper grammar and a professional sign-off if appropriate.', tones: ['Polished', 'Approachable', 'Confident'] },
        'Slack / Teams':  { guidance: 'This is a Slack or Teams message. Keep it concise and direct but still professional. Okay to be slightly informal — no need for full email formality.', tones: ['Clean', 'Friendly', 'Direct'] },
        'Formal letter':  { guidance: 'This is a formal letter or official communication. Use proper structure, formal language, and a respectful tone throughout.', tones: ['Polished', 'Diplomatic', 'Authoritative'] },
        'Social media':   { guidance: 'This is a social media post or comment. Keep it engaging, authentic, and concise. Match the casual energy of social platforms.', tones: ['Smooth', 'Bold', 'Witty'] },
      };

      const RELATIONSHIP_GUIDANCE: Record<string, string> = {
        'to my manager':  'Writing to a manager/supervisor — be respectful of hierarchy, clear, and proactive.',
        'to a coworker':  'Writing to a peer/coworker — balanced tone, collaborative, and approachable.',
        'to a client':    'Writing to a client — prioritize professionalism, service, and clarity.',
        'to a friend':    'Writing to a friend — be natural, warm, and relaxed.',
        'to my landlord': 'Writing to a landlord — be polite, clear about the issue, and firm if needed.',
        'general':        'General audience — use a broadly appropriate tone.',
      };

      const typeConfig = FIX_TYPE_CONFIG[messageType ?? ''] ?? { guidance: 'Rewrite to sound natural in American English.', tones: ['Polished', 'Friendly', 'Confident'] as [string, string, string] };
      const relGuidance = RELATIONSHIP_GUIDANCE[relationship ?? ''] ?? '';
      const [t1, t2, t3] = typeConfig.tones;
      const fixPersonalization = buildPersonalizationNote(toneProfile, relationshipProfile, contactNotes);

      const message = await getAnthropic().messages.create({
        model: MODEL_QUALITY,
        max_tokens: 1024,
        system: `You are an American English writing coach helping non-native speakers sound natural. ${typeConfig.guidance}${relGuidance ? ' ' + relGuidance : ''}${fixPersonalization}

Rewrite the draft in 3 distinct styles: "${t1}" (most polished/safe), "${t2}" (balanced), "${t3}" (boldest). For each, list 2-3 short bullet improvements explaining what you changed and why. Return ONLY valid JSON, no markdown:
{"fixes":[{"tone":"${t1}","text":"...","improvements":["...","..."]},{"tone":"${t2}","text":"...","improvements":["...","..."]},{"tone":"${t3}","text":"...","improvements":["...","..."]}]}`,
        messages: [{
          role: 'user',
          content: `Draft: "${draft}"\n\nRewrite in 3 styles (${t1}, ${t2}, ${t3}).`,
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

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
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

    if (mode === 'converse-debrief') {
      const { persona, history } = body;
      if (!persona || !history) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      const historyText = history.map((h) => `${h.speaker === 'ai' ? persona : 'You'}: "${h.text}"`).join('\n');

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
        max_tokens: 256,
        system: `You are a supportive American English coach. Review this conversation practice session and give brief, encouraging feedback. Return ONLY valid JSON, no markdown:
{"highlight":"one specific thing they did well, max 20 words","tip":"one concrete improvement tip, max 20 words","fluency":"Excellent"|"Good"|"Keep practicing"}`,
        messages: [{
          role: 'user',
          content: `Persona: ${persona}\n\nConversation:\n${historyText}\n\nGive encouraging feedback on this practice session.`,
        }],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ highlight: string; tip: string; fluency: 'Excellent' | 'Good' | 'Keep practicing' }>(raw);
      return NextResponse.json(parsed);
    }

    if (mode === 'replies-stream') {
      const { prompt, context, toneProfile } = body;
      if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

      const config = CONTEXT_CONFIG[context ?? 'Any'] ?? CONTEXT_CONFIG.Any;
      const contextNote = config.description;
      const toneLabels = config.tones;
      const ndjsonExample = toneLabels.map(t => `{"tone":"${t}","text":"reply here"}`).join('\n');
      const streamPersonalization = buildPersonalizationNote(toneProfile);

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const stream = getAnthropic().messages.stream({
              model: MODEL_QUALITY,
              max_tokens: 512,
              system: `You are an American English conversation coach helping non-native speakers respond naturally. Generate exactly 4 short, authentic replies. Output each reply as a separate JSON object on its own line (NDJSON), in this exact order, with no other text before or after:
${ndjsonExample}
Each reply must be under 20 words, use contractions, and sound like a real American would say it.${streamPersonalization}`,
              messages: [{
                role: 'user',
                content: `Someone said: "${prompt}"\n${contextNote}`,
              }],
            });

            let buffer = '';
            for await (const event of stream) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                buffer += event.delta.text;
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed) controller.enqueue(encoder.encode(trimmed + '\n'));
                }
              }
            }
            if (buffer.trim()) controller.enqueue(encoder.encode(buffer.trim() + '\n'));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    }

    if (mode === 'pack-variations') {
      const { prompt, toneProfile, relationshipProfile, contactNotes } = body;
      if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });

      const packPersonalization = buildPersonalizationNote(toneProfile, relationshipProfile, contactNotes);

      const message = await getAnthropic().messages.create({
        model: MODEL_FAST,
        max_tokens: 512,
        system: `You are an American English conversation coach. Given a message someone sent, generate 4 natural reply variations in different tones: Casual, Funny, Warm, and Safe. Each reply should sound like a real American would say it. Use contractions. Keep each reply under 25 words. Return ONLY valid JSON: {"variations":[{"tone":"Casual","text":"..."},{"tone":"Funny","text":"..."},{"tone":"Warm","text":"..."},{"tone":"Safe","text":"..."}]}. No markdown.${packPersonalization}`,
        messages: [{
          role: 'user',
          content: `Someone said: "${prompt}"\n\nGenerate 4 reply variations (Casual, Funny, Warm, Safe).`,
        }],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text : '';
      const parsed = parseJson<{ variations: { tone: string; text: string }[] }>(raw);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
