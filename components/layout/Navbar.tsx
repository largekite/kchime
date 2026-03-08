'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BookOpen, Briefcase, Dumbbell, Gift, Mic, MessageSquare, Package, RefreshCw, Wand2, Users, Lightbulb, Sliders, UserCircle } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/shared/AuthModal';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { NotificationToggle } from '@/components/layout/NotificationPrompt';

const tabs = [
  { href: '/reply', label: 'Quick Reply', Icon: MessageSquare },
  { href: '/fix', label: 'Fix Message', Icon: Wand2 },
  { href: '/work', label: 'Work', Icon: Briefcase },
  { href: '/converse', label: 'Converse', Icon: Users },
  { href: '/live', label: 'Live', Icon: Mic },
  { href: '/packs', label: 'Packs', Icon: Package },
  { href: '/practice', label: 'Practice', Icon: Dumbbell, alsoActive: ['/custom'] },
  { href: '/library', label: 'Library', Icon: BookOpen },
  { href: '/review', label: 'Review', Icon: RefreshCw },
  { href: '/daily', label: 'Daily', Icon: Lightbulb },
  { href: '/dashboard', label: 'Dashboard', Icon: BarChart2 },
  { href: '/contacts', label: 'Contacts', Icon: UserCircle },
  { href: '/tone', label: 'Tone', Icon: Sliders },
  { href: '/refer', label: 'Refer', Icon: Gift },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, plan, loading, signOut } = useAuth();

  if (pathname === '/') return null;
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600" aria-hidden>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold tracking-tight text-gray-900">KChime</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">beta</span>
          </div>

          {/* Auth / user area */}
          {!loading && (
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  <span className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </span>
                  {plan === 'pro' && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">Pro</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Sign in
                </button>
              )}

              {showMenu && user && (
                <div
                  className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50"
                  onBlur={() => setShowMenu(false)}
                >
                  <p className="px-4 py-2 text-xs text-gray-400 truncate">{user.email}</p>
                  <div className="border-t border-gray-100 my-1" />
                  {plan === 'free' && (
                    <button
                      onClick={() => { setShowMenu(false); setShowUpgrade(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 transition"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                  <NotificationToggle />
                  <button
                    onClick={() => { setShowMenu(false); signOut(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab nav */}
        <nav className="mx-auto max-w-4xl overflow-x-auto px-4">
          <div className="flex gap-1 pb-0">
            {tabs.map(({ href, label, Icon, alsoActive }) => {
              const active = pathname.startsWith(href) || (alsoActive?.some((p) => pathname.startsWith(p)) ?? false);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUpgrade && (
        <UpgradePrompt
          reason="Unlock unlimited replies, Live Listen, and cross-device sync."
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
