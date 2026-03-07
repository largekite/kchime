import { NextRequest, NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { signJWT } from '@/lib/jwt';
import sql from '@/lib/db';

// Apple's public JWKS endpoint
const APPLE_JWKS = createRemoteJWKSet(
  new URL('https://appleid.apple.com/auth/keys')
);

export async function POST(req: NextRequest) {
  let body: { identityToken?: string; authorizationCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { identityToken } = body;
  if (!identityToken) {
    return NextResponse.json({ error: 'identityToken is required' }, { status: 400 });
  }

  // 1. Verify Apple identity token
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

  // 2. Upsert user in Supabase users table
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
    console.error('Database error during upsert:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  // 3. Issue a session JWT (HS256, 90-day expiry)
  const token = await signJWT({
    sub: user.id,
    appleUserID: user.apple_user_id,
    isPro: user.is_pro,
  });

  return NextResponse.json({ token });
}
