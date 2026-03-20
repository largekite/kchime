'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, Dumbbell, MessageSquare, UserCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/shared/AuthModal';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import { NotificationToggle } from '@/components/layout/NotificationPrompt';

// 4 main tabs — clean, natural flow
const ALL_TABS = [
  { href: '/reply', label: 'Reply', Icon: MessageSquare, matches: ['/reply', '/fix', '/work'] },
  { href: '/practice', label: 'Practice', Icon: Dumbbell, matches: ['/practice', '/converse', '/live', '/packs', '/custom'] },
  { href: '/learn', label: 'Learn', Icon: BookOpen, matches: ['/learn', '/library', '/review', '/daily'] },
  { href: '/me', label: 'Me', Icon: UserCircle, matches: ['/me', '/dashboard', '/tone', '/contacts', '/refer'] },
];

function isActive(pathname: string, matches: string[]) {
  return matches.some((m) => pathname.startsWith(m));
}

export function Navbar() {
  const pathname = usePathname();
  const { user, plan, loading, signOut } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  if (pathname === '/') return null;

  return (
    <>
      {/* ─── Top header (both mobile & desktop) ─── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur" role="banner">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-600" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold tracking-tight text-gray-900">KChime</span>
          </div>

          {/* Auth */}
          {!loading && (
            <div className="relative" ref={menuRef}>
              {user ? (
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={showMenu}
                  aria-haspopup="true"
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-teal-200"
                >
                  <span className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  {plan === 'pro' && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">Pro</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
                >
                  Sign in
                </button>
              )}

              {showMenu && user && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white border border-gray-100 shadow-lg py-1 z-50" role="menu" aria-label="Account options">
                  <p className="px-4 py-2 text-xs text-gray-400 truncate">{user.email}</p>
                  <div className="border-t border-gray-100 my-1" />
                  {plan === 'free' && (
                    <button
                      onClick={() => { setShowMenu(false); setShowUpgrade(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-teal-600 font-medium hover:bg-teal-50 transition"
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
      <aside className="hidden md:fixed md:top-[57px] md:left-0 md:bottom-0 md:flex md:w-52 md:flex-col md:border-r md:border-gray-100 md:bg-white md:z-30" aria-label="Main navigation">
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {ALL_TABS.map(({ href, label, Icon, matches }) => {
            const active = isActive(pathname, matches);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-200',
                  active
                    ? 'bg-teal-50 text-teal-700'
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden" aria-label="Main navigation">
        <div className="flex items-stretch justify-around">
          {ALL_TABS.map(({ href, label, Icon, matches }) => {
            const active = isActive(pathname, matches);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 rounded-lg',
                  active ? 'text-teal-600' : 'text-gray-400'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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
