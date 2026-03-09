'use client';

import { useState } from 'react';
import { MessageSquare, Wand2, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

const QuickReplyTab = dynamic(() => import('./QuickReplyTab'), { ssr: false });
const FixTab = dynamic(() => import('./FixTab'), { ssr: false });
const WorkTab = dynamic(() => import('./WorkTab'), { ssr: false });

type ReplyMode = 'quick' | 'fix' | 'work';

const MODES: { id: ReplyMode; label: string; desc: string; Icon: typeof MessageSquare }[] = [
  { id: 'quick', label: 'Quick Reply', desc: 'Get replies to what someone said', Icon: MessageSquare },
  { id: 'fix', label: 'Fix Message', desc: 'Polish your draft message', Icon: Wand2 },
  { id: 'work', label: 'Work Reply', desc: 'Strategic workplace responses', Icon: Briefcase },
];

export default function ReplyHubPage() {
  const [mode, setMode] = useState<ReplyMode>('quick');

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
      {mode === 'quick' && <QuickReplyTab />}
      {mode === 'fix' && <FixTab />}
      {mode === 'work' && <WorkTab />}
    </div>
  );
}
