'use client';

import { useState } from 'react';
import { BookOpen, RefreshCw, Lightbulb } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

const LibraryTab = dynamic(() => import('./LibraryTab'), { ssr: false });
const ReviewTab = dynamic(() => import('./ReviewTab'), { ssr: false });
const DailyTab = dynamic(() => import('./DailyTab'), { ssr: false });

type LearnMode = 'library' | 'review' | 'daily';

const MODES: { id: LearnMode; label: string; Icon: typeof BookOpen }[] = [
  { id: 'library', label: 'Saved Phrases', Icon: BookOpen },
  { id: 'review', label: 'Review', Icon: RefreshCw },
  { id: 'daily', label: 'Daily Phrase', Icon: Lightbulb },
];

export default function LearnHubPage() {
  const [mode, setMode] = useState<LearnMode>('library');

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
      {mode === 'library' && <LibraryTab onNavigate={(tab) => setMode(tab as LearnMode)} />}
      {mode === 'review' && <ReviewTab onNavigate={(tab) => setMode(tab as LearnMode)} />}
      {mode === 'daily' && <DailyTab />}
    </div>
  );
}
