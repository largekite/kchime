/**
 * POST /api/email/preference
 *
 * Toggle the user's weekly digest opt-in.
 * Auth: Bearer <access_token>
 *
 * Body: { enabled: boolean }
 * Returns: { weekly_digest: boolean }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createUserClient, createServiceClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userClient = createUserClient(token);
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { enabled?: boolean };
  if (typeof body.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Missing enabled boolean' }, { status: 400 });
  }

  // Use service client so we can upsert even if the user has no subscriptions row yet
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      { user_id: user.id, weekly_digest: body.enabled },
      { onConflict: 'user_id' },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ weekly_digest: body.enabled });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userClient = createUserClient(token);
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('weekly_digest')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({ weekly_digest: data?.weekly_digest ?? false });
}
