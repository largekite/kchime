'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { getProgress, saveProgress, getSavedPhrases } from '@/lib/storage';

export type Plan = 'free' | 'pro';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  plan: Plan;
  loading: boolean;
  /** Sign up with email + password (new users). */
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Sign in with email + password (returning users). */
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshPlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  plan: 'free',
  loading: true,
  signUpWithEmail: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  sendPasswordReset: async () => ({ error: null }),
  signOut: async () => {},
  refreshPlan: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [plan, setPlan] = useState<Plan>('free');
  const [loading, setLoading] = useState(true);
  const syncedRef = useRef<string | null>(null);

  const fetchPlan = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .single();
    setPlan((data?.plan as Plan) ?? 'free');
  }, [supabase]);

  /** Push localStorage data to Supabase on first sign-in for this session. */
  const syncLocalToCloud = useCallback(async (userId: string) => {
    if (syncedRef.current === userId) return;
    syncedRef.current = userId;

    try {
      const progress = getProgress();
      const phrases = getSavedPhrases();

      // Upsert progress
      await supabase.from('user_progress').upsert(
        { user_id: userId, data: progress, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );

      // Upsert saved phrases
      if (phrases.length > 0) {
        await supabase.from('saved_phrases').upsert(
          phrases.map((p) => ({ ...p, user_id: userId })),
          { onConflict: 'id,user_id' },
        );
      }
    } catch {
      // Non-critical: sync failure shouldn't block auth flow
    }
  }, [supabase]);

  /** Pull progress from cloud and merge into localStorage. */
  const pullFromCloud = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('data')
        .eq('user_id', userId)
        .single();
      if (data?.data) {
        const local = getProgress();
        const cloud = data.data as ReturnType<typeof getProgress>;
        // Merge field-by-field: take the best of each dimension
        const merged = {
          ...local,
          xp: Math.max(local.xp ?? 0, cloud.xp ?? 0),
          completedScenarios: [
            ...new Set([...(local.completedScenarios ?? []), ...(cloud.completedScenarios ?? [])]),
          ],
          streak: Math.max(local.streak ?? 0, cloud.streak ?? 0),
          lastActiveDate: [local.lastActiveDate, cloud.lastActiveDate]
            .filter(Boolean)
            .sort()
            .pop() ?? local.lastActiveDate,
        };
        saveProgress(merged);
      }
    } catch {
      // Non-critical: pull failure shouldn't block auth flow
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPlan(session.user.id);
        syncLocalToCloud(session.user.id);
        pullFromCloud(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPlan(session.user.id);
        syncLocalToCloud(session.user.id);
        pullFromCloud(session.user.id);
      } else {
        setPlan('free');
        syncedRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchPlan, syncLocalToCloud, pullFromCloud]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/reply` },
    });
    if (error) return { error: error.message };
    // Supabase sends a confirmation email on sign-up
    return { error: null };
  }, [supabase]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const refreshPlan = useCallback(async () => {
    if (user) await fetchPlan(user.id);
  }, [user, fetchPlan]);

  return (
    <AuthContext.Provider value={{ user, session, plan, loading, signUpWithEmail, signInWithPassword, signInWithGoogle, sendPasswordReset, signOut, refreshPlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
