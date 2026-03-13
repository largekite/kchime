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
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single();

  const isPro = sub?.plan === 'pro';
  const limit = isPro ? 20 : 5;

  const { data } = await supabase
    .from('daily_usage')
    .select('quick_reply_count')
    .eq('user_id', user.id)
    .eq('date', getToday())
    .single();

  const count = data?.quick_reply_count ?? 0;

  return NextResponse.json({ count, limit, isPro });
}
