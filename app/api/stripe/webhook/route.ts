import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceClient();

  async function getSupabaseUserId(customerId: string): Promise<string | null> {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    return customer.metadata?.supabase_user_id ?? null;
  }

  async function upsertSubscription(
    userId: string,
    sub: Stripe.Subscription,
    plan: 'free' | 'pro',
  ) {
    await supabase.from('subscriptions').upsert(
      {
        user_id: userId,
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
        plan,
        status: sub.status,
        current_period_end: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const userId = sub.metadata?.supabase_user_id
        ?? (await getSupabaseUserId(session.customer as string));
      if (!userId) break;
      await upsertSubscription(userId, sub, 'pro');
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id
        ?? (await getSupabaseUserId(sub.customer as string));
      if (!userId) break;
      const isPro = sub.status === 'active' || sub.status === 'trialing';
      await upsertSubscription(userId, sub, isPro ? 'pro' : 'free');
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id
        ?? (await getSupabaseUserId(sub.customer as string));
      if (!userId) break;
      await upsertSubscription(userId, sub, 'free');
      break;
    }
  }

  return NextResponse.json({ received: true });
}
