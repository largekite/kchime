import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';

/** Server-side client with service role — bypasses RLS. Use only in API routes. */
export function createServiceClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Server-side client using a user JWT — respects RLS. */
export function createUserClient(accessToken: string) {
  const client = createClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  client.auth.setSession({ access_token: accessToken, refresh_token: '' });
  return client;
}
