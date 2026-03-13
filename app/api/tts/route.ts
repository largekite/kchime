import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const FREE_TTS_LIMIT = 15;
const PRO_TTS_LIMIT = 60;

// Cache the OpenAI client as a singleton to avoid connection setup overhead per request
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

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
// Uses optimistic locking to prevent concurrent requests from bypassing limits.
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

  // Optimistic lock: only update if count hasn't changed since we read it
  const { data: updated } = await supabase
    .from('daily_usage')
    .update({ tts_count: count + 1 })
    .eq('user_id', userId)
    .eq('date', today)
    .eq('tts_count', count)
    .select('tts_count')
    .single();

  // If no row was updated, another request incremented first — re-check
  if (!updated) {
    const { data: recheck } = await supabase
      .from('daily_usage')
      .select('tts_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    return ((recheck as { tts_count: number } | null)?.tts_count ?? 0) < limit;
  }

  return true;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };
  if (!text) return new Response('Missing text', { status: 400 });

  const { plan, userId } = await getSubscription(req);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'auth_required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limit = plan === 'pro' ? PRO_TTS_LIMIT : FREE_TTS_LIMIT;
  const today = new Date().toISOString().split('T')[0];

  // Check and increment limit BEFORE calling OpenAI to avoid wasting API calls
  const withinLimit = await checkAndIncrement(userId, today, limit);
  if (!withinLimit) {
    return new Response(JSON.stringify({ error: 'limit_reached' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ttsResponse = await getOpenAI().audio.speech.create({
    model: 'tts-1', voice: 'nova', input: text, response_format: 'mp3',
  });
  const buffer = await ttsResponse.arrayBuffer();
  return new Response(buffer, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  });
}
