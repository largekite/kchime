import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Sign in via Supabase anon client (uses email/password flow)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? 'Sign in failed.' }, { status: 401 });
  }

  const token = data.session.access_token;

  // Look up Pro status
  const service = createServiceClient();
  const { data: sub } = await service
    .from('subscriptions')
    .select('plan')
    .eq('user_id', data.user.id)
    .single();

  const isPro = sub?.plan === 'pro';

  return NextResponse.json({ token, email, isPro });
}
