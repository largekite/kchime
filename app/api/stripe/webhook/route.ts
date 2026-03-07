import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

async function setTierStatus(
  appleUserID: string,
  isPro: boolean,
  isMax: boolean,
  periodEnd: Date | null
) {
  await sql`
    UPDATE users
    SET
      is_pro         = ${isPro},
      is_max         = ${isMax},
      pro_expires_at = ${periodEnd ? periodEnd.toISOString() : null}
    WHERE apple_user_id = ${appleUserID}
  `;
}

function getTier(sub: Stripe.Subscription): { isPro: boolean; isMax: boolean } {
  const priceId = sub.items?.data?.[0]?.price?.id;
  const isMax = !!process.env.STRIPE_MAX_PRICE_ID && priceId === process.env.STRIPE_MAX_PRICE_ID;
  return { isPro: true, isMax };
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
        const appleUserID = sub.metadata?.apple_user_id;
        if (!appleUserID) break;

        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const rawEnd = sub.items?.data?.[0]?.current_period_end;
        const periodEnd = rawEnd ? new Date(rawEnd * 1000) : null;
        const { isPro, isMax } = isActive ? getTier(sub) : { isPro: false, isMax: false };
        await setTierStatus(appleUserID, isPro, isMax, isActive ? periodEnd : null);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const appleUserID = sub.metadata?.apple_user_id;
        if (!appleUserID) break;

        await setTierStatus(appleUserID, false, false, null);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof subRef === 'string' ? subRef : subRef?.id;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const appleUserID = sub.metadata?.apple_user_id;
        if (!appleUserID) break;

        await setTierStatus(appleUserID, false, false, null);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
