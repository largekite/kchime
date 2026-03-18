'use client';

import { useState, useCallback } from 'react';
import { BarChart2, Sliders, UserCircle, Gift } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { TabSkeleton } from '@/components/shared/Skeleton';

const DashboardTab = dynamic(() => import('./DashboardTab'), { ssr: false, loading: () => <TabSkeleton /> });
const ToneTab = dynamic(() => import('./ToneTab'), { ssr: false, loading: () => <TabSkeleton /> });
const ContactsTab = dynamic(() => import('./ContactsTab'), { ssr: false, loading: () => <TabSkeleton /> });
const ReferTab = dynamic(() => import('./ReferTab'), { ssr: false, loading: () => <TabSkeleton /> });

type MeMode = 'dashboard' | 'settings' | 'contacts' | 'refer';

const MODES: { id: MeMode; label: string; Icon: typeof BarChart2 }[] = [
  { id: 'dashboard', label: 'Progress', Icon: BarChart2 },
  { id: 'settings', label: 'Tone', Icon: Sliders },
  { id: 'contacts', label: 'Contacts', Icon: UserCircle },
  { id: 'refer', label: 'Refer', Icon: Gift },
];

export default function MeHubPage() {
  const [mode, setMode] = useState<MeMode>('dashboard');
  const [animKey, setAnimKey] = useState(0);

  const switchMode = useCallback((id: MeMode) => {
    setMode(id);
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Profile sections">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => switchMode(id)}
            role="tab"
            aria-selected={mode === id}
            aria-controls={`panel-${id}`}
            className={clsx(
              'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-200',
              mode === id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:bg-teal-50'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div key={animKey} className="animate-tab-in" role="tabpanel" id={`panel-${mode}`}>
        {mode === 'dashboard' && <DashboardTab />}
        {mode === 'settings' && <ToneTab />}
        {mode === 'contacts' && <ContactsTab />}
        {mode === 'refer' && <ReferTab />}
      </div>
    </div>
  );
}
