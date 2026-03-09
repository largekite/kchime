'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';

interface Props {
  /** Short reason shown to the user, e.g. "You've used 5 Quick Replies today." */
  reason: string;
  onClose: () => void;
}

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/4gM28lfhk5zy18X2m85sA00';

export function UpgradePrompt({ reason, onClose }: Props) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  function handleUpgrade() {
    if (!user) {
      setShowAuth(true);
      return;
    }
    const url = new URL(STRIPE_PAYMENT_LINK);
    url.searchParams.set('client_reference_id', user.id);
    if (user.email) url.searchParams.set('prefilled_email', user.email);
    window.location.href = url.toString();
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
            '50 Quick Replies per day',
            '50 Work Reply Optimizer uses per day',
            'Live Listen (real-time suggestions)',
            'Progress synced across all devices',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-indigo-800">
              <span className="text-indigo-500 font-bold">&#10003;</span>
              {f}
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={handleUpgrade}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Upgrade — $7 / month
          </button>

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
