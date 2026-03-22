'use client';

import { useState, useCallback } from 'react';
import { Dumbbell, Users, Package } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { TabSkeleton } from '@/components/shared/Skeleton';

const ScenariosTab = dynamic(() => import('./ScenariosTab'), { ssr: false, loading: () => <TabSkeleton /> });
const ConverseTab = dynamic(() => import('./ConverseTab'), { ssr: false, loading: () => <TabSkeleton /> });
const PacksTab = dynamic(() => import('./PacksTab'), { ssr: false, loading: () => <TabSkeleton /> });

type PracticeMode = 'scenarios' | 'converse' | 'packs';

const MODES: { id: PracticeMode; label: string; subtitle: string; Icon: typeof Dumbbell }[] = [
  { id: 'scenarios', label: 'Scenarios', subtitle: 'Guided role-play drills', Icon: Dumbbell },
  { id: 'converse', label: 'Converse', subtitle: 'Chat with an AI partner', Icon: Users },
  { id: 'packs', label: 'Packs', subtitle: 'Themed phrase sets', Icon: Package },
];

export default function PracticeHubPage() {
  const [mode, setMode] = useState<PracticeMode>('scenarios');
  const [animKey, setAnimKey] = useState(0);

  const switchMode = useCallback((id: PracticeMode) => {
    setMode(id);
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Practice modes">
        {MODES.map(({ id, label, subtitle, Icon }) => (
          <button
            key={id}
            onClick={() => switchMode(id)}
            role="tab"
            aria-selected={mode === id}
            aria-controls={`panel-${id}`}
            className={clsx(
              'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-200 lg:px-6 lg:py-3 lg:text-base lg:gap-3 lg:rounded-2xl',
              mode === id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:bg-teal-50'
            )}
          >
            <Icon className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
            <span className="flex flex-col items-start leading-tight">
              <span>{label}</span>
              <span className={clsx('text-[10px] font-normal', mode === id ? 'text-teal-200' : 'text-gray-400')}>
                {subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div key={animKey} className="animate-tab-in" role="tabpanel" id={`panel-${mode}`}>
        {mode === 'scenarios' && <ScenariosTab />}
        {mode === 'converse' && <ConverseTab />}
        {mode === 'packs' && <PacksTab />}
      </div>
    </div>
  );
}
