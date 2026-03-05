import { createClient } from '@supabase/supabase-js';

/** Server-side client with service role — bypasses RLS. Use only in API routes. */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

/** Server-side client using a user JWT — respects RLS. */
export function createUserClient(accessToken: string) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  client.auth.setSession({ access_token: accessToken, refresh_token: '' });
  return client;
}
