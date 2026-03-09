'use client';

import { useState } from 'react';
import { BarChart2, Sliders, UserCircle, Gift } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

const DashboardTab = dynamic(() => import('./DashboardTab'), { ssr: false });
const ToneTab = dynamic(() => import('./ToneTab'), { ssr: false });
const ContactsTab = dynamic(() => import('./ContactsTab'), { ssr: false });
const ReferTab = dynamic(() => import('./ReferTab'), { ssr: false });

type MeMode = 'dashboard' | 'settings' | 'contacts' | 'refer';

const MODES: { id: MeMode; label: string; Icon: typeof BarChart2 }[] = [
  { id: 'dashboard', label: 'Progress', Icon: BarChart2 },
  { id: 'settings', label: 'Tone', Icon: Sliders },
  { id: 'contacts', label: 'Contacts', Icon: UserCircle },
  { id: 'refer', label: 'Refer', Icon: Gift },
];

export default function MeHubPage() {
  const [mode, setMode] = useState<MeMode>('dashboard');

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={clsx(
              'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition',
              mode === id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {mode === 'dashboard' && <DashboardTab />}
      {mode === 'settings' && <ToneTab />}
      {mode === 'contacts' && <ContactsTab />}
      {mode === 'refer' && <ReferTab />}
    </div>
  );
}
