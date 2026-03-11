import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function upsertSubscription(
  userId: string,
  plan: 'pro' | 'free',
  periodEnd: Date | null,
  stripeCustomerId?: string,
) {
  const supabase = createServiceClient();
  const payload: Record<string, unknown> = {
    user_id: userId,
    plan,
    period_end: periodEnd?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };
  if (stripeCustomerId) payload.stripe_customer_id = stripeCustomerId;
  const { error } = await supabase
    .from('subscriptions')
    .upsert(payload, { onConflict: 'user_id' });
  if (error) throw new Error(`Failed to upsert subscription: ${error.message}`);
}

async function clearPlanByCustomer(stripeCustomerId: string) {
  const supabase = createServiceClient();
  await supabase
    .from('subscriptions')
    .update({ plan: 'free' })
    .eq('stripe_customer_id', stripeCustomerId);
}

function getCustomerId(sub: Stripe.Subscription): string {
  return typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe environment variables not configured' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {

      // Payment link checkout — user_id comes from client_reference_id
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const custId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        if (!userId || !custId) break;
        await upsertSubscription(userId, 'pro', null, custId);
        break;
      }

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
        if (userId) {
          await upsertSubscription(userId, 'free', null);
        } else {
          await clearPlanByCustomer(getCustomerId(sub));
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = sub.metadata?.user_id;
        if (userId) {
          await upsertSubscription(userId, 'free', null);
        } else {
          await clearPlanByCustomer(getCustomerId(sub));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
