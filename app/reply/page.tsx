'use client';

import { useState, useCallback } from 'react';
import { MessageSquare, Wand2, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { TabSkeleton } from '@/components/shared/Skeleton';

const QuickReplyTab = dynamic(() => import('./QuickReplyTab'), { ssr: false, loading: () => <TabSkeleton /> });
const FixTab = dynamic(() => import('./FixTab'), { ssr: false, loading: () => <TabSkeleton /> });
const WorkTab = dynamic(() => import('./WorkTab'), { ssr: false, loading: () => <TabSkeleton /> });

type ReplyMode = 'quick' | 'fix' | 'work';

const MODES: { id: ReplyMode; label: string; desc: string; Icon: typeof MessageSquare }[] = [
  { id: 'quick', label: 'Quick Reply', desc: 'Get replies to what someone said', Icon: MessageSquare },
  { id: 'fix', label: 'Fix Message', desc: 'Polish your draft message', Icon: Wand2 },
  { id: 'work', label: 'Work Reply', desc: 'Strategic workplace responses', Icon: Briefcase },
];

export default function ReplyHubPage() {
  const [mode, setMode] = useState<ReplyMode>('quick');
  const [animKey, setAnimKey] = useState(0);

  const switchMode = useCallback((id: ReplyMode) => {
    setMode(id);
    setAnimKey((k) => k + 1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Reply modes">
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
        {mode === 'quick' && <QuickReplyTab />}
        {mode === 'fix' && <FixTab />}
        {mode === 'work' && <WorkTab />}
      </div>
    </div>
  );
}
