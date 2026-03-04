'use client';

import { useEffect, useState } from 'react';
import type { BadgeId } from '@/types';
import { BADGE_MAP } from '@/lib/gamification';

interface Props {
  newBadges: BadgeId[];
  onDismiss: () => void;
}

export function BadgeToast({ newBadges, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newBadges.length > 0) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [newBadges, onDismiss]);

  if (newBadges.length === 0) return null;
  const badge = BADGE_MAP[newBadges[0]];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 shadow-2xl text-white min-w-[260px]">
        <span className="text-3xl">{badge.emoji}</span>
        <div>
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Badge Unlocked!</p>
          <p className="font-bold text-sm">{badge.name}</p>
          <p className="text-xs text-gray-400">{badge.description}</p>
        </div>
        <span className="ml-auto text-indigo-400 font-bold text-sm">+{badge.xpReward} XP</span>
      </div>
    </div>
  );
}
