/**
 * POST /api/push/send
 *
 * Cron endpoint — sends daily practice reminders to all subscribed users.
 * Trigger this from Vercel Cron, GitHub Actions, or any scheduler at 9am UTC.
 *
 * Requires env vars:
 *   CRON_SECRET         — secret header value to authenticate the cron caller
 *   VAPID_PUBLIC_KEY    — VAPID public key (generate with: npx web-push generate-vapid-keys)
 *   VAPID_PRIVATE_KEY   — VAPID private key
 *   VAPID_SUBJECT       — mailto: or https: URL for VAPID contact
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import webPush from 'web-push';

const MESSAGES = [
  { title: "Don't lose your streak! 🔥", body: "Your daily English practice is waiting. Just 3 minutes." },
  { title: "Time to practice! 💬", body: "Open KChime and complete today's conversation scenario." },
  { title: "Ready to sound more natural? 🎯", body: "A quick practice session will make a big difference." },
  { title: "Your English coach is waiting 📚", body: "Pick up where you left off — 47 scenarios ready for you." },
];

export async function POST(req: NextRequest) {
  // Auth check — only allow cron caller
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:hello@kchime.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const supabase = createServiceClient();
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('endpoint, subscription');

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0 });
  }

  const msg = MESSAGES[new Date().getDay() % MESSAGES.length];
  const payload = JSON.stringify({ title: msg.title, body: msg.body, url: '/practice' });

  const results = await Promise.allSettled(
    subscriptions.map(({ subscription }) =>
      webPush.sendNotification(subscription as webPush.PushSubscription, payload)
    ),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;

  // Clean up expired subscriptions (410 Gone)
  const expiredEndpoints = subscriptions
    .filter((_, i) => {
      const r = results[i];
      return r.status === 'rejected' &&
        (r as PromiseRejectedResult).reason?.statusCode === 410;
    })
    .map(({ endpoint }) => endpoint);

  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
  }

  return NextResponse.json({ sent, failed, expired: expiredEndpoints.length });
}
