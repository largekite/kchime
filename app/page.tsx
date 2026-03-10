import Link from 'next/link';
import { MessageSquare, Keyboard, Zap } from 'lucide-react';

export const metadata = {
  title: 'KChime — Daily Conversation Coach',
  description: 'Your daily conversation coach for sounding natural in English — at work, with friends, or anywhere.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-indigo-600">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold tracking-tight text-gray-900">KChime</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/reply"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Open App
            </Link>
            <a
              href="#pricing"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Get Pro
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-8">
          <Zap className="h-3.5 w-3.5" />
          Daily Conversation Coach
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl leading-tight">
          Reply naturally in English,{' '}
          <span className="text-indigo-600">every time</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          KChime suggests fluent, context-aware replies right inside your iPhone keyboard — so you always know what to say at work, with friends, or anywhere.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/reply"
            className="flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-gray-700 transition"
          >
            Try Free — No Download
          </Link>
          <a
            href="#pricing"
            className="rounded-full border-2 border-indigo-600 px-7 py-3.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
          >
            Get Pro on the web
          </a>
        </div>
        <p className="mt-5 text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/reply" className="text-indigo-600 hover:underline font-medium">
            Open the web app
          </Link>
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need to reply with confidence</h2>
          <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">
            Built for non-native English speakers who want to sound natural at work and in daily life.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <Keyboard className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keyboard Extension</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Suggestions appear right inside your iPhone keyboard — no switching apps, no copy-paste.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Context</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Paste what someone said and get 4 natural replies — casual, professional, short, detailed.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Powered by Claude — responses are fluent, idiomatic, and ready to send in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, honest pricing</h2>
        <p className="text-center text-gray-500 mb-14">Start free. Upgrade when you need more.</p>
        <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Free</p>
            <p className="text-4xl font-extrabold text-gray-900 mb-1">$0</p>
            <p className="text-sm text-gray-400 mb-8">forever</p>
            <ul className="space-y-3 mb-8">
              {['10 Quick Replies per day', '3 Fix My Message per day', 'Keyboard extension', '4 reply styles'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/reply"
              className="block text-center rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Get Started Free
            </Link>
          </div>
          {/* Pro — most popular */}
          <div className="rounded-2xl border-2 border-indigo-600 p-8 relative shadow-lg shadow-indigo-100">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">MOST POPULAR</span>
            </div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Pro</p>
            <p className="text-4xl font-extrabold text-gray-900 mb-1">$7</p>
            <p className="text-sm text-gray-400 mb-8">per month</p>
            <ul className="space-y-3 mb-8">
              {[
                '50 Quick Replies per day',
                'Unlimited Fix My Message',
                'Live Listen & Practice',
                'Works on iOS + web',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/reply"
              className="block text-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Get Pro — $7/month
            </a>
          </div>
          {/* Max */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Max</p>
            <p className="text-4xl font-extrabold text-gray-900 mb-1">$12</p>
            <p className="text-sm text-gray-400 mb-8">per month</p>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited replies',
                'Everything in Pro',
                'Priority support',
                'Early access to new features',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@kchime.app?subject=KChime Max"
              className="block text-center rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-indigo-500">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm">&copy; {new Date().getFullYear()} KChime</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/privacy" className="hover:text-gray-600 transition">Privacy</a>
            <a href="/terms" className="hover:text-gray-600 transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
