import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

async function getUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = createServiceClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

/** POST — save a push subscription for the user. */
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscription } = await req.json() as { subscription: PushSubscriptionJSON };
  if (!subscription?.endpoint) return NextResponse.json({ error: 'Missing subscription' }, { status: 400 });

  const supabase = createServiceClient();
  const { error: upsertError } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      subscription: subscription,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  if (upsertError) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** DELETE — remove a push subscription. */
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { endpoint } = await req.json() as { endpoint: string };
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });

  const supabase = createServiceClient();
  const { error: deleteError } = await supabase.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint);

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
