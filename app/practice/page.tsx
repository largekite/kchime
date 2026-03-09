'use client';

import { useState } from 'react';
import { Dumbbell, Users, Mic, Package } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

const ScenariosTab = dynamic(() => import('./ScenariosTab'), { ssr: false });
const ConverseTab = dynamic(() => import('./ConverseTab'), { ssr: false });
const LiveTab = dynamic(() => import('./LiveTab'), { ssr: false });
const PacksTab = dynamic(() => import('./PacksTab'), { ssr: false });

type PracticeMode = 'scenarios' | 'converse' | 'live' | 'packs';

const MODES: { id: PracticeMode; label: string; Icon: typeof Dumbbell }[] = [
  { id: 'scenarios', label: 'Scenarios', Icon: Dumbbell },
  { id: 'converse', label: 'Converse', Icon: Users },
  { id: 'live', label: 'Live Listen', Icon: Mic },
  { id: 'packs', label: 'Packs', Icon: Package },
];

export default function PracticeHubPage() {
  const [mode, setMode] = useState<PracticeMode>('scenarios');

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
      {mode === 'scenarios' && <ScenariosTab />}
      {mode === 'converse' && <ConverseTab />}
      {mode === 'live' && <LiveTab />}
      {mode === 'packs' && <PacksTab />}
    </div>
  );
}
