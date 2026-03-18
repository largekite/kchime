'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onClose: () => void;
  onSent?: () => void;
}

type Mode = 'sign-in' | 'sign-up' | 'forgot';

export function AuthModal({ onClose, onSent }: Props) {
  const { signInWithPassword, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpSent, setSignUpSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'forgot') {
      if (!email.trim()) return;
      const { error } = await sendPasswordReset(email.trim());
      setLoading(false);
      if (error) setError(error);
      else setResetSent(true);
      return;
    }

    if (!email.trim() || !password.trim()) return;

    if (mode === 'sign-up') {
      const { error } = await signUpWithEmail(email.trim(), password.trim());
      setLoading(false);
      if (error) setError(error);
      else { setSignUpSent(true); onSent?.(); }
    } else {
      const { error } = await signInWithPassword(email.trim(), password.trim());
      setLoading(false);
      if (error) setError(error);
      else onClose();
    }
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError('');
    setResetSent(false);
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
            <button onClick={onClose} className="mt-6 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
              Got it
            </button>
          </div>
        ) : resetSent ? (
          <div className="text-center py-4">
            <p className="text-xl font-bold text-gray-900 mb-2">Check your email</p>
            <p className="text-sm text-gray-500">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <button onClick={onClose} className="mt-6 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
              Got it
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <>
            <p className="text-xl font-bold text-gray-900">Reset your password</p>
            <p className="text-sm text-gray-500 mt-1 mb-5">Enter your email and we&apos;ll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-gray-400">
              <button onClick={() => switchMode('sign-in')} className="text-teal-600 font-medium hover:underline">
                Back to sign in
              </button>
            </p>
          </>
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
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              {mode === 'sign-in' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
              >
                {loading
                  ? (mode === 'sign-in' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'sign-in' ? 'Sign in' : 'Sign up')}
              </button>
            </form>

            <div className="relative flex items-center my-4">
              <div className="flex-grow border-t border-gray-200" />
              <span className="mx-3 text-xs text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <button
              type="button"
              disabled={googleLoading}
              onClick={async () => {
                setGoogleLoading(true);
                setError('');
                try {
                  const { error } = await signInWithGoogle();
                  if (error) { setError(error); setGoogleLoading(false); }
                } catch {
                  setError('Could not connect to Google. Please try again.');
                  setGoogleLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              {mode === 'sign-in' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => switchMode('sign-up')} className="text-teal-600 font-medium hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchMode('sign-in')} className="text-teal-600 font-medium hover:underline">
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
