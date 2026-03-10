import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function upsertSubscription(
  userId: string,
  plan: 'pro' | 'free',
  periodEnd: Date | null,
) {
  const supabase = createServiceClient();
  await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      plan,
      period_end: periodEnd?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}


export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const rawEnd = sub.items?.data?.[0]?.current_period_end;
        const periodEnd = rawEnd ? new Date(rawEnd * 1000) : null;
        const plan = isActive ? 'pro' : 'free';
        await upsertSubscription(userId, plan, isActive ? periodEnd : null);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        await upsertSubscription(userId, 'free', null);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        await upsertSubscription(userId, 'free', null);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
