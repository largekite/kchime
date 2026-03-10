'use client';

import { useEffect, useState } from 'react';

interface Props {
  level: number;
  levelName: string;
  onDone: () => void;
}

export function LevelUpToast({ level, levelName, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 shadow-2xl text-white min-w-[260px]">
        <div>
          <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Level Up!</p>
          <p className="font-bold">Level {level} — {levelName}</p>
        </div>
      </div>
    </div>
  );
}
