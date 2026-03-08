'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2, BookOpen, Briefcase, Dumbbell, Gift, Mic,
  MessageSquare, Package, RefreshCw, Wand2, Users,
  Lightbulb, Sliders, UserCircle, MoreHorizontal, X,
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/shared/AuthModal';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { NotificationToggle } from '@/components/layout/NotificationPrompt';

// All tabs in display order
const ALL_TABS = [
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

// Mobile bottom bar: 4 primary tabs + More
const PRIMARY_TABS = ALL_TABS.slice(0, 4);
const OVERFLOW_TABS = ALL_TABS.slice(4);

function isActive(pathname: string, href: string, alsoActive?: readonly string[]) {
  return pathname.startsWith(href) || (alsoActive?.some((p) => pathname.startsWith(p)) ?? false);
}

export function Navbar() {
  const pathname = usePathname();
  const { user, plan, loading, signOut } = useAuth();

  if (pathname === '/') return null;

  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const moreIsActive = OVERFLOW_TABS.some((t) => isActive(pathname, t.href, 'alsoActive' in t ? t.alsoActive : undefined));

  return (
    <>
      {/* ─── Top header (both mobile & desktop) ─── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600" aria-hidden>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold tracking-tight text-gray-900">KChime</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">beta</span>
          </div>

          {/* Auth */}
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
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50">
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
      </header>

      {/* ─── Desktop: vertical sidebar (hidden on mobile) ─── */}
      <aside className="hidden md:fixed md:top-[57px] md:left-0 md:bottom-0 md:flex md:w-52 md:flex-col md:border-r md:border-gray-100 md:bg-white md:z-30">
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {ALL_TABS.map(({ href, label, Icon, ...rest }) => {
            const active = isActive(pathname, href, 'alsoActive' in rest ? (rest as { alsoActive: string[] }).alsoActive : undefined);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── Mobile: bottom tab bar (hidden on desktop) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-stretch justify-around">
          {PRIMARY_TABS.map(({ href, label, Icon, ...rest }) => {
            const active = isActive(pathname, href, 'alsoActive' in rest ? (rest as { alsoActive: string[] }).alsoActive : undefined);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-indigo-600' : 'text-gray-400'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className={clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              moreIsActive ? 'text-indigo-600' : 'text-gray-400'
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ─── Mobile "More" sheet ─── */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white pb-8 pt-3 shadow-2xl animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">More</span>
              <button onClick={() => setShowMore(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1 px-3 pt-3">
              {OVERFLOW_TABS.map(({ href, label, Icon, ...rest }) => {
                const active = isActive(pathname, href, 'alsoActive' in rest ? (rest as { alsoActive: string[] }).alsoActive : undefined);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMore(false)}
                    className={clsx(
                      'flex flex-col items-center gap-1 rounded-xl py-3 text-[11px] font-medium transition-colors',
                      active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
