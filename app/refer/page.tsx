'use client';

import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/shared/AuthModal';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Check, Copy, Gift, Share2, Users } from 'lucide-react';

interface ReferralData {
  code: string;
  total_referred: number;
  total_activated: number;
}

const HOW_IT_WORKS = [
  { step: '1', text: 'Share your unique link with a friend who wants to improve their English.' },
  { step: '2', text: 'They sign up and complete their first practice scenario.' },
  { step: '3', text: 'You both get 7 days of Pro — free.' },
];

export default function ReferPage() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFetching(true);

    async function fetchCode() {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch('/api/refer', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json() as ReferralData;
        setReferral(data);
      }
    }

    fetchCode().finally(() => setFetching(false));
  }, [user]);

  const referralUrl = referral
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://kchime.app'}/?ref=${referral.code}`
    : '';

  async function handleCopy() {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!referralUrl) return;
    if (navigator.share) {
      await navigator.share({
        title: 'KChime — Speak natural English',
        text: 'I use KChime to practice speaking natural American English. Try it free!',
        url: referralUrl,
      }).catch(() => {});
    } else {
      await handleCopy();
    }
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Gift className="h-7 w-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Give a week, get a week</h1>
        <p className="text-sm text-gray-500">
          Invite friends to KChime. When they complete their first practice, you both get 7 days of Pro free.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">How it works</p>
        <div className="space-y-3">
          {HOW_IT_WORKS.map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral link */}
      {!loading && (
        user ? (
          fetching ? (
            <div className="text-center text-sm text-gray-400 py-4">Getting your link…</div>
          ) : referral ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your referral link</p>
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
                  <span className="flex-1 text-sm text-gray-700 truncate font-mono">{referralUrl}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={clsx(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                      copied
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    )}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-500">Invited</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{referral.total_referred}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Gift className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium text-gray-500">Activated</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{referral.total_activated}</p>
                </div>
              </div>

              {referral.total_activated > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-sm text-emerald-700 font-medium">
                  You&apos;ve earned {referral.total_activated * 7} days of Pro from referrals!
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-sm text-red-500 py-4">Couldn't load your referral link. Try again.</div>
          )
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center space-y-3">
            <p className="text-sm text-gray-600 font-medium">Sign in to get your referral link</p>
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Sign in
            </button>
          </div>
        )
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
