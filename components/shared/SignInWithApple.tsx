'use client';

import { useState } from 'react';

interface Props {
  onSuccess: (jwt: string) => void;
  label?: string;
}

export function SignInWithApple({ onSuccess, label = 'Sign in with Apple' }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    setError('');

    if (!window.AppleID) {
      setError('Apple Sign-In is not available. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      const result = await window.AppleID.auth.signIn();

      const res = await fetch('/api/auth/apple/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityToken: result.authorization.id_token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Authentication failed');
      }

      const { token } = await res.json();
      localStorage.setItem('kchime_apple_jwt', token);
      onSuccess(token);
    } catch (err: unknown) {
      // Apple throws { error: 'popup_closed_by_user' } when dismissed — ignore silently
      if (err && typeof err === 'object' && 'error' in err) {
        const code = (err as { error: string }).error;
        if (code === 'popup_closed_by_user') return;
      }
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-900 transition disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        {loading ? 'Signing in…' : label}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
