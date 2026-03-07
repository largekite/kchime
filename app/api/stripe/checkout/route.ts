import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // Require a valid session JWT
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
  }

  let session: Awaited<ReturnType<typeof verifyJWT>>;
  try {
    session = await verifyJWT(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    // Store apple_user_id on the subscription so the webhook can look up the user
    subscription_data: {
      metadata: {
        apple_user_id: session.appleUserID,
        user_id: session.sub,
      },
    },
    success_url: `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
