'use client';

import { useEffect, useState, useCallback } from 'react';
import type { BadgeId } from '@/types';
import { BADGE_MAP } from '@/lib/gamification';

interface Props {
  newBadges: BadgeId[];
  onDismiss: () => void;
}

export function BadgeToast({ newBadges, onDismiss }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const showNext = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      if (currentIndex + 1 < newBadges.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        onDismiss();
      }
    }, 300);
  }, [currentIndex, newBadges.length, onDismiss]);

  useEffect(() => {
    if (newBadges.length > 0 && currentIndex < newBadges.length) {
      setVisible(true);
      const t = setTimeout(showNext, 4000);
      return () => clearTimeout(t);
    }
  }, [newBadges, currentIndex, showNext]);

  // Reset index when new badges come in
  useEffect(() => {
    setCurrentIndex(0);
  }, [newBadges]);

  if (newBadges.length === 0 || currentIndex >= newBadges.length) return null;
  const badge = BADGE_MAP[newBadges[currentIndex]];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 shadow-2xl text-white min-w-[260px]">
        <span className="text-3xl">{badge.emoji}</span>
        <div>
          <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Badge Unlocked!</p>
          <p className="font-bold text-sm">{badge.name}</p>
          <p className="text-xs text-gray-400">{badge.description}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <span className="text-teal-400 font-bold text-sm">+{badge.xpReward} XP</span>
          {newBadges.length > 1 && (
            <span className="text-[10px] text-gray-500">
              {currentIndex + 1} / {newBadges.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
