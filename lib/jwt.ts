import { SignJWT, jwtVerify } from 'jose';

export interface SessionPayload {
  sub: string;        // user UUID from the users table
  appleUserID: string;
  isPro: boolean;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as SessionPayload;
}
