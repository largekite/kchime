'use client';

import { useEffect, useState } from 'react';

interface Props {
  amount: number;
  onDone: () => void;
}

export function XpPopup({ amount, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-md transition-all duration-400 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      }`}
    >
      +{amount} XP
    </span>
  );
}
