/**
 * POST /api/auth/webhook
 *
 * Supabase Auth webhook — triggered on user signup events.
 * Configure in Supabase Dashboard > Auth > Hooks > Send Email.
 *
 * Sends a welcome email via Resend when a new user signs up.
 *
 * Required env vars:
 *   SUPABASE_AUTH_WEBHOOK_SECRET — shared secret to verify Supabase webhook
 *   RESEND_API_KEY               — Resend API key
 *   RESEND_FROM                  — verified sender, e.g. "KChime <hello@kchime.app>"
 */
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const secret = req.headers.get('x-webhook-secret');
  if (!process.env.SUPABASE_AUTH_WEBHOOK_SECRET || secret !== process.env.SUPABASE_AUTH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { type?: string; record?: { email?: string; raw_user_meta_data?: Record<string, unknown> } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only handle INSERT events (new signups)
  if (body.type !== 'INSERT') {
    return NextResponse.json({ ok: true });
  }

  const email = body.record?.email;
  if (!email) {
    return NextResponse.json({ ok: true });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM ?? 'KChime <hello@kchime.app>';
  const name = (body.record?.raw_user_meta_data?.full_name as string) || '';
  const greeting = name ? `Hi ${name}` : 'Welcome';

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Welcome to KChime!',
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px 28px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;">KChime</p>
          <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Your daily conversation coach</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">${greeting}!</p>
          <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
            Thanks for joining KChime. You're now ready to practice sounding natural in English every day.
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
            Here's what you can do right away:
          </p>
          <table width="100%" style="margin:0 0 24px;">
            <tr><td style="padding:8px 0;font-size:14px;color:#4b5563;">&#10003; Paste any message and get 4 natural replies</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#4b5563;">&#10003; Practice real-world conversation scenarios</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#4b5563;">&#10003; Track your streak and earn badges</td></tr>
          </table>
          <table width="100%"><tr><td align="center">
            <a href="https://kchime.app/reply"
               style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">
              Start Practicing
            </a>
          </td></tr></table>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            You're receiving this because you signed up for KChime.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
  });

  if (error) {
    console.error('Welcome email failed:', error);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
