'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SettingsModal } from '@/components/shared/SettingsModal';
import clsx from 'clsx';

const tabs = [
  { href: '/', label: 'Quick Reply', icon: '⚡' },
  { href: '/live', label: 'Live', icon: '🎙️' },
  { href: '/practice', label: 'Practice', icon: '🏋️' },
  { href: '/library', label: 'Library', icon: '📚' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export function Navbar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔔</span>
            <span className="text-xl font-bold tracking-tight text-gray-900">KChime</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">beta</span>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            aria-label="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Tab nav */}
        <nav className="mx-auto max-w-4xl overflow-x-auto px-4">
          <div className="flex gap-1 pb-0">
            {tabs.map((tab) => {
              const active = tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={clsx(
                    'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
