import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch subscription and daily usage in parallel to reduce latency
  const [subResult, usageResult] = await Promise.all([
    supabase.from('subscriptions').select('plan').eq('user_id', user.id).single(),
    supabase.from('daily_usage').select('quick_reply_count').eq('user_id', user.id).eq('date', getToday()).single(),
  ]);

  const isPro = subResult.data?.plan === 'pro';
  const limit = isPro ? 50 : 10;
  const count = usageResult.data?.quick_reply_count ?? 0;

  return NextResponse.json({
    email: user.email,
    isPro,
    usage: { count, limit },
  });
}
