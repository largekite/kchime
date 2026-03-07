'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { SignInWithApple } from './SignInWithApple';

interface Props {
  /** Short reason shown to the user, e.g. "You've used 5 Quick Replies today." */
  reason: string;
  onClose: () => void;
}

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM28lfhk5zy18X2m85sA00';

export function UpgradePrompt({ reason, onClose }: Props) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [appleJWT, setAppleJWT] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    setAppleJWT(localStorage.getItem('kchime_apple_jwt'));
  }, []);

  function handleWebUpgrade() {
    if (!user) {
      setShowAuth(true);
      return;
    }
    const url = new URL(STRIPE_PAYMENT_LINK);
    url.searchParams.set('client_reference_id', user.id);
    if (user.email) url.searchParams.set('prefilled_email', user.email);
    window.location.href = url.toString();
  }

  async function handleAppleCheckout(jwt: string) {
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to start checkout');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong');
      setCheckoutLoading(false);
    }
  }

  function handleAppleSignInSuccess(jwt: string) {
    setAppleJWT(jwt);
    handleAppleCheckout(jwt);
  }

  if (showAuth) {
    return (
      <AuthModal
        onClose={() => setShowAuth(false)}
        onSent={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xl font-bold text-gray-900">Upgrade to Pro</p>
        <p className="text-sm text-gray-500 mt-1">{reason}</p>

        <div className="mt-5 rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-2">
          {[
            'Unlimited Quick Replies',
            'Unlimited Work Reply Optimizer',
            'Live Listen (real-time suggestions)',
            'Progress synced across all devices',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-indigo-800">
              <span className="text-indigo-500 font-bold">✓</span>
              {f}
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          {/* Web upgrade (email / Google auth) */}
          <button
            onClick={handleWebUpgrade}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Upgrade — $7 / month
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-400">have the iOS app?</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* iOS Pro — Apple Sign-In + Stripe checkout */}
          {appleJWT ? (
            <div>
              <button
                onClick={() => handleAppleCheckout(appleJWT)}
                disabled={checkoutLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-900 transition disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                {checkoutLoading ? 'Loading…' : 'Get Pro — syncs with iOS app'}
              </button>
              {checkoutError && <p className="mt-1.5 text-xs text-red-600">{checkoutError}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-xs text-gray-400 text-center">
                Sign in with Apple to sync Pro with your iPhone
              </p>
              <SignInWithApple
                onSuccess={handleAppleSignInSuccess}
                label="Sign in with Apple to upgrade"
              />
              {checkoutError && <p className="mt-1 text-xs text-red-600">{checkoutError}</p>}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
