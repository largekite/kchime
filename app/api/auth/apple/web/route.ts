import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { signJWT } from '@/lib/jwt';
import sql from '@/lib/db';

const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys')
);

// Apple POSTs to this redirect URI with application/x-www-form-urlencoded.
// With usePopup: true the JS SDK intercepts the popup response and this route
// is mainly the registered redirect URI; Apple may still POST here in edge cases.
export async function POST(req: NextRequest) {
  let identityToken: string | null = null;

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    identityToken = params.get('id_token');
  } else {
    const body = await req.json().catch(() => ({}));
    identityToken = body.identityToken ?? null;
  }

  if (!identityToken) {
    return NextResponse.json({ error: 'Missing id_token' }, { status: 400 });
  }

  let appleUserID: string;
  try {
    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID,
    });
    appleUserID = payload.sub as string;
  } catch (err) {
    console.error('Apple token verification failed:', err);
    return NextResponse.json({ error: 'Invalid identity token' }, { status: 401 });
  }

  let user: { id: string; apple_user_id: string; is_pro: boolean };
  try {
    const rows = await sql<{ id: string; apple_user_id: string; is_pro: boolean }[]>`
      INSERT INTO users (apple_user_id, created_at)
      VALUES (${appleUserID}, NOW())
      ON CONFLICT (apple_user_id) DO UPDATE
        SET apple_user_id = EXCLUDED.apple_user_id
      RETURNING id, apple_user_id, is_pro
    `;
    user = rows[0];
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  const token = await signJWT({
    sub: user.id,
    appleUserID: user.apple_user_id,
    isPro: user.is_pro,
  });

  return NextResponse.json({ token });
}
