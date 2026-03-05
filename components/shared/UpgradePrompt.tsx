'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';

interface Props {
  /** Short reason shown to the user, e.g. "You've used 5 Quick Replies today." */
  reason: string;
  onClose: () => void;
}

export function UpgradePrompt({ reason, onClose }: Props) {
  const { user, session } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!user || !session) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
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
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Redirecting…' : 'Upgrade — $7 / month'}
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
