import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const FREE_TTS_LIMIT = 20;
const PRO_TTS_LIMIT = 100;

async function getSubscription(req: NextRequest): Promise<{ plan: 'free' | 'pro'; userId: string | null }> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return { plan: 'free', userId: null };

  try {
    const supabase = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return { plan: 'free', userId: null };

    const { data } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single();
    return { plan: data?.plan === 'pro' ? 'pro' : 'free', userId: user.id };
  } catch {
    return { plan: 'free', userId: null };
  }
}

// Returns true if within limit and increments, false if limit reached.
// Uses a single upsert+update round-trip to minimise DB calls.
async function checkAndIncrement(userId: string, today: string, limit: number): Promise<boolean> {
  const supabase = createServiceClient();

  // Ensure the row exists, then fetch current count
  const { data } = await supabase
    .from('daily_usage')
    .upsert({ user_id: userId, date: today }, { onConflict: 'user_id,date' })
    .select('tts_count')
    .single();

  const count = (data as { tts_count: number } | null)?.tts_count ?? 0;
  if (count >= limit) return false;

  await supabase
    .from('daily_usage')
    .update({ tts_count: count + 1 })
    .eq('user_id', userId)
    .eq('date', today);

  return true;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };
  if (!text) return new Response('Missing text', { status: 400 });

  const { plan, userId } = await getSubscription(req);
  const limit = plan === 'pro' ? PRO_TTS_LIMIT : FREE_TTS_LIMIT;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (userId) {
    const today = new Date().toISOString().split('T')[0];

    // Kick off OpenAI and DB usage update in parallel to hide DB latency
    const [withinLimit, ttsResponse] = await Promise.all([
      checkAndIncrement(userId, today, limit),
      openai.audio.speech.create({ model: 'tts-1', voice: 'nova', input: text, response_format: 'mp3' }),
    ]);

    if (!withinLimit) {
      return new Response(JSON.stringify({ error: 'limit_reached' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await ttsResponse.arrayBuffer();
    return new Response(buffer, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  }

  // No auth — anonymous user, no usage tracking
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
    response_format: 'mp3',
  });

  const buffer = await response.arrayBuffer();
  return new Response(buffer, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
}
