import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const FREE_TTS_LIMIT = 10;
const PRO_TTS_LIMIT = 40;
const ANON_TTS_LIMIT = 5;
const MAX_TEXT_LENGTH = 500;

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

// In-memory IP-based rate limiting for anonymous users.
// Avoids writing to daily_usage (user_id may be UUID-typed with FK constraint).
// Resets naturally on serverless cold starts; good enough to prevent abuse.
const anonCounts = new Map<string, { count: number; date: string }>();

function checkAnonLimit(ip: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  const entry = anonCounts.get(ip);

  if (!entry || entry.date !== today) {
    anonCounts.set(ip, { count: 1, date: today });
    return true;
  }

  if (entry.count >= ANON_TTS_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json() as { text: string };
    if (!text) return new Response('Missing text', { status: 400 });

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters.` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { plan, userId } = await getSubscription(req);

    // Rate-limit authenticated users
    if (userId) {
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
    } else {
      // Anonymous user — in-memory IP-based rate limiting
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
      if (!checkAnonLimit(ip)) {
        return new Response(JSON.stringify({ error: 'limit_reached' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const ttsResponse = await getOpenAI().audio.speech.create({
      model: 'tts-1', voice: 'nova', input: text, response_format: 'mp3',
    });
    const buffer = await ttsResponse.arrayBuffer();
    return new Response(buffer, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
