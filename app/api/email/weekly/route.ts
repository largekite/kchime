/**
 * POST /api/email/weekly
 *
 * Cron endpoint — sends weekly practice digest emails to opted-in users.
 * Trigger every Monday at 8am UTC from Vercel Cron, GitHub Actions, or any scheduler.
 *
 * Required env vars:
 *   CRON_SECRET       — secret header value to authenticate the cron caller
 *   RESEND_API_KEY    — Resend API key (https://resend.com)
 *   RESEND_FROM       — verified sender address, e.g. "KChime <hello@kchime.app>"
 *
 * Required Supabase migration (run once):
 *   ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS weekly_digest boolean DEFAULT false;
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

interface ProgressData {
  xp?: number;
  streak?: number;
  earnedBadges?: string[];
  daily?: { date: string; scenariosCompleted: number }[];
}

interface SavedPhrase {
  id: string;
  srs?: { nextReview: string };
}

function getWeeklyScenarios(daily: ProgressData['daily'] = []): number {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  return daily
    .filter((d) => d.date >= weekAgoStr)
    .reduce((sum, d) => sum + d.scenariosCompleted, 0);
}

function buildEmailHtml(opts: {
  email: string;
  streak: number;
  xp: number;
  scenariosThisWeek: number;
  badgesTotal: number;
  phrasesdue: number;
}): string {
  const { streak, xp, scenariosThisWeek, badgesTotal, phrasesdue } = opts;

  const streakMsg =
    streak === 0 ? 'Start your streak today!'
    : streak === 1 ? '1-day streak — keep going!'
    : `${streak}-day streak — you're on fire!`;

  const practiceLine =
    scenariosThisWeek === 0
      ? "You haven't practiced this week yet — now's a great time to start."
      : `You completed ${scenariosThisWeek} scenario${scenariosThisWeek === 1 ? '' : 's'} this week. Nice work!`;

  const reviewLine =
    phrasesdue === 0
      ? "You're all caught up on phrase reviews!"
      : `${phrasesdue} phrase${phrasesdue === 1 ? ' is' : 's are'} ready for review in your library.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your KChime Weekly Recap</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px 28px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">KChime</p>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Your weekly English practice recap</p>
        </td>
      </tr>

      <!-- Streak callout -->
      <tr>
        <td style="padding:28px 40px 0;">
          <table width="100%" style="background:#fef3c7;border-radius:12px;padding:16px 20px;">
            <tr>
              <td style="font-size:24px;width:36px;">🔥</td>
              <td style="font-size:15px;font-weight:600;color:#92400e;padding-left:12px;">${streakMsg}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Stats grid -->
      <tr>
        <td style="padding:24px 40px 0;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <!-- XP -->
              <td width="48%" style="background:#ede9fe;border-radius:12px;padding:18px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:800;color:#4f46e5;">${xp.toLocaleString()}</p>
                <p style="margin:4px 0 0;font-size:12px;font-weight:600;color:#6d28d9;text-transform:uppercase;letter-spacing:0.5px;">Total XP</p>
              </td>
              <td width="4%"></td>
              <!-- Badges -->
              <td width="48%" style="background:#d1fae5;border-radius:12px;padding:18px;text-align:center;">
                <p style="margin:0;font-size:28px;font-weight:800;color:#065f46;">${badgesTotal}</p>
                <p style="margin:4px 0 0;font-size:12px;font-weight:600;color:#047857;text-transform:uppercase;letter-spacing:0.5px;">Badges Earned</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Practice summary -->
      <tr>
        <td style="padding:20px 40px 0;">
          <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">${practiceLine}</p>
        </td>
      </tr>

      <!-- Review nudge (only show if phrases are due) -->
      ${phrasesdue > 0 ? `
      <tr>
        <td style="padding:12px 40px 0;">
          <table width="100%" style="background:#eff6ff;border-radius:12px;padding:14px 18px;">
            <tr>
              <td style="font-size:20px;width:28px;">📚</td>
              <td style="font-size:14px;color:#1e40af;padding-left:10px;">${reviewLine}</td>
            </tr>
          </table>
        </td>
      </tr>` : ''}

      <!-- CTA -->
      <tr>
        <td style="padding:28px 40px;">
          <table width="100%">
            <tr>
              <td align="center">
                <a href="https://kchime.app/practice"
                   style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;">
                  Practice Now →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            You're receiving this because you opted into weekly recaps.
            <br/>
            <a href="https://kchime.app/dashboard" style="color:#6b7280;text-decoration:underline;">Manage preferences</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM ?? 'KChime <hello@kchime.app>';
  const supabase = createServiceClient();

  // Fetch opted-in users with their email from auth.users
  const { data: optedIn, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('weekly_digest', true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!optedIn?.length) {
    return NextResponse.json({ sent: 0, message: 'No opted-in users' });
  }

  const userIds = optedIn.map((r) => r.user_id);
  const today = new Date().toISOString().split('T')[0];

  // Fetch user emails from auth
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>(
    (authUsers?.users ?? [])
      .filter((u) => userIds.includes(u.id) && u.email)
      .map((u) => [u.id, u.email!])
  );

  // Fetch progress for all opted-in users
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('user_id, data')
    .in('user_id', userIds);

  const progressMap = new Map<string, ProgressData>(
    (progressRows ?? []).map((r) => [r.user_id, r.data as ProgressData])
  );

  // Fetch saved phrases to count due for review
  const { data: phraseRows } = await supabase
    .from('saved_phrases')
    .select('user_id, srs')
    .in('user_id', userIds);

  const dueMap = new Map<string, number>();
  for (const row of phraseRows ?? []) {
    const phrase = row as { user_id: string; srs?: SavedPhrase['srs'] };
    const isDue = !phrase.srs || phrase.srs.nextReview <= today;
    if (isDue) {
      dueMap.set(phrase.user_id, (dueMap.get(phrase.user_id) ?? 0) + 1);
    }
  }

  let sent = 0;
  let failed = 0;

  for (const userId of userIds) {
    const email = emailMap.get(userId);
    if (!email) continue;

    const progress = progressMap.get(userId) ?? {};
    const xp = progress.xp ?? 0;
    const streak = progress.streak ?? 0;
    const badgesTotal = (progress.earnedBadges ?? []).length;
    const scenariosThisWeek = getWeeklyScenarios(progress.daily);
    const phrasesdue = dueMap.get(userId) ?? 0;

    const html = buildEmailHtml({ email, streak, xp, scenariosThisWeek, badgesTotal, phrasesdue });

    const { error: sendError } = await resend.emails.send({
      from,
      to: email,
      subject: streak > 0
        ? `Your ${streak}-day streak is waiting 🔥 — KChime Weekly`
        : 'Your KChime Weekly Recap',
      html,
    });

    if (sendError) {
      failed++;
    } else {
      sent++;
    }
  }

  return NextResponse.json({ sent, failed, total: userIds.length });
}
