import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

/** GET /api/refer — returns the referral code for the authenticated user, creating one if needed. */
export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check for existing code
  const { data: existing } = await supabase
    .from('referrals')
    .select('code, total_referred, total_activated')
    .eq('referrer_id', user.id)
    .single();

  if (existing) return NextResponse.json(existing);

  // Generate a short code from user ID
  const code = user.id.replace(/-/g, '').slice(0, 8).toUpperCase();

  const { error: insertError } = await supabase.from('referrals').insert({
    referrer_id: user.id,
    code,
    total_referred: 0,
    total_activated: 0,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 });
  }

  return NextResponse.json({ code, total_referred: 0, total_activated: 0 });
}
