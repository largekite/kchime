'use client';

import { useState, useCallback } from 'react';
import { BookOpen, RefreshCw, Lightbulb } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { TabSkeleton } from '@/components/shared/Skeleton';

const LibraryTab = dynamic(() => import('./LibraryTab'), { ssr: false, loading: () => <TabSkeleton /> });
const ReviewTab = dynamic(() => import('./ReviewTab'), { ssr: false, loading: () => <TabSkeleton /> });
const DailyTab = dynamic(() => import('./DailyTab'), { ssr: false, loading: () => <TabSkeleton /> });

type LearnMode = 'library' | 'review' | 'daily';

const MODES: { id: LearnMode; label: string; Icon: typeof BookOpen }[] = [
  { id: 'library', label: 'Saved Phrases', Icon: BookOpen },
  { id: 'review', label: 'Review', Icon: RefreshCw },
  { id: 'daily', label: 'Daily Phrase', Icon: Lightbulb },
];

export default function LearnHubPage() {
  const [mode, setMode] = useState<LearnMode>('library');
  const [animKey, setAnimKey] = useState(0);

  const switchMode = useCallback((id: LearnMode) => {
    setMode(id);
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Learn modes">
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
        {mode === 'library' && <LibraryTab onNavigate={(tab) => switchMode(tab as LearnMode)} />}
        {mode === 'review' && <ReviewTab onNavigate={(tab) => switchMode(tab as LearnMode)} />}
        {mode === 'daily' && <DailyTab />}
      </div>
    </div>
  );
}
