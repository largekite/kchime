import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Authenticate via Supabase session token
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  // Support both Pro and Business tiers via request body
  const body = await req.json().catch(() => ({})) as { tier?: string };
  const tier = body.tier ?? 'pro';
  const priceId = tier === 'max'
    ? process.env.STRIPE_MAX_PRICE_ID!
    : process.env.STRIPE_PRO_PRICE_ID!;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        user_id: user.id,
      },
    },
    success_url: `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
