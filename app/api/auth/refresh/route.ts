import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { refreshToken } = await req.json().catch(() => ({}));
  if (!refreshToken) {
    return NextResponse.json({ error: 'Missing refresh token.' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? 'Refresh failed.' }, { status: 401 });
  }

  return NextResponse.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
  });
}
