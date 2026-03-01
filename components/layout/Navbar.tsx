'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, BookOpen, Briefcase, Dumbbell, Mic, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

const tabs = [
  { href: '/', label: 'Quick Reply', Icon: MessageSquare },
  { href: '/work', label: 'Work', Icon: Briefcase },
  { href: '/live', label: 'Live', Icon: Mic },
  { href: '/practice', label: 'Practice', Icon: Dumbbell },
  { href: '/library', label: 'Library', Icon: BookOpen },
  { href: '/dashboard', label: 'Dashboard', Icon: BarChart2 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
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
      </div>

      {/* Tab nav */}
      <nav className="mx-auto max-w-4xl overflow-x-auto px-4">
        <div className="flex gap-1 pb-0">
          {tabs.map(({ href, label, Icon }) => {
            const active = href === '/'
              ? pathname === '/'
              : pathname.startsWith(href);
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
  );
}
