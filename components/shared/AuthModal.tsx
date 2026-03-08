'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onClose: () => void;
  onSent?: () => void;
}

type Mode = 'sign-in' | 'sign-up';

export function AuthModal({ onClose, onSent }: Props) {
  const { signInWithPassword, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpSent, setSignUpSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    if (mode === 'sign-up') {
      const { error } = await signUpWithEmail(email.trim(), password.trim());
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        setSignUpSent(true);
        onSent?.();
      }
    } else {
      const { error } = await signInWithPassword(email.trim(), password.trim());
      setLoading(false);
      if (error) {
        setError(error);
      } else {
        onClose();
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {signUpSent ? (
          <div className="text-center py-4">
            <p className="text-xl font-bold text-gray-900 mb-2">Check your email</p>
            <p className="text-sm text-gray-500">
              We sent a confirmation link to <strong>{email}</strong>. Click it to verify your account.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <p className="text-xl font-bold text-gray-900">
              {mode === 'sign-in' ? 'Sign in to KChime' : 'Create your account'}
            </p>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              {mode === 'sign-in'
                ? 'Welcome back! Enter your email and password.'
                : 'Save your progress across devices and unlock Pro.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading
                  ? (mode === 'sign-in' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'sign-in' ? 'Sign in' : 'Sign up')}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-gray-400">
              {mode === 'sign-in' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setMode('sign-up'); setError(''); }}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('sign-in'); setError(''); }}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
