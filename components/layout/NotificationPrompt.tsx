'use client';

import { isNotificationsSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } from '@/lib/notifications';
import { useAuth } from '@/context/AuthContext';
import { Bell, BellOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Floating notification opt-in banner shown after user completes 2+ scenarios. */
export function NotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !isNotificationsSupported()) return;
    if (localStorage.getItem('notif_dismissed')) return;

    // Only show after 2+ practice completions
    try {
      const raw = localStorage.getItem('kchime_progress');
      if (!raw) return;
      const progress = JSON.parse(raw) as { completedScenarios?: string[] };
      if ((progress.completedScenarios?.length ?? 0) < 2) return;
    } catch {
      return;
    }

    isSubscribed().then((sub) => {
      setSubscribed(sub);
      if (!sub) setShow(true);
    });
  }, [user]);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      const ok = await subscribeToPush(token);
      if (ok) {
        setSubscribed(true);
        setShow(false);
        localStorage.setItem('notif_dismissed', '1');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      await unsubscribeFromPush(token);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('notif_dismissed', '1');
  }

  if (dismissed || !show || subscribed) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-2xl bg-white border border-teal-100 shadow-xl p-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Bell className="h-4.5 w-4.5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Don&apos;t lose your streak</p>
          <p className="text-xs text-gray-500 mt-0.5">Get a daily reminder to practice — takes 3 minutes a day.</p>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="mt-2.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Enabling…' : 'Enable reminders'}
          </button>
        </div>
        <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 transition flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Small toggle used inside settings / profile area. */
export function NotificationToggle() {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isNotificationsSupported());
    if (isNotificationsSupported()) {
      isSubscribed().then(setSubscribed);
    }
  }, []);

  if (!user || !supported) return null;

  async function toggle() {
    setLoading(true);
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      if (subscribed) {
        await unsubscribeFromPush(token);
        setSubscribed(false);
      } else {
        const ok = await subscribeToPush(token);
        if (ok) setSubscribed(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
    >
      {subscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {subscribed ? 'Turn off reminders' : 'Enable daily reminders'}
    </button>
  );
}
