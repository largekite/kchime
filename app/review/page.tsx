'use client';

import { useState, useEffect } from 'react';
import { getDueForReview, updateSRS } from '@/lib/storage';
import type { SavedPhrase, Tone } from '@/types';
import clsx from 'clsx';
import Link from 'next/link';

const TONE_STYLES: Record<Tone, string> = {
  Casual: 'bg-indigo-100 text-indigo-700',
  Funny: 'bg-amber-100 text-amber-700',
  Warm: 'bg-pink-100 text-pink-700',
  Safe: 'bg-emerald-100 text-emerald-700',
};

export default function ReviewPage() {
  const [queue, setQueue] = useState<SavedPhrase[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, missed: 0 });

  useEffect(() => {
    const due = getDueForReview();
    // Shuffle
    const shuffled = [...due].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    if (shuffled.length === 0) setDone(true);
  }, []);

  const current = queue[index];

  function handleAnswer(quality: 0 | 1) {
    updateSRS(current.id, quality);
    setStats((s) => ({
      remembered: quality === 1 ? s.remembered + 1 : s.remembered,
      missed: quality === 0 ? s.missed + 1 : s.missed,
    }));
    if (index + 1 >= queue.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-4">
        <p className="text-2xl font-bold text-gray-900">Review complete</p>
        {queue.length > 0 ? (
          <>
            <p className="text-gray-500">
              {stats.remembered} remembered &middot; {stats.missed} missed
            </p>
            <p className="text-sm text-gray-400">
              Missed phrases come back tomorrow. Keep practicing!
            </p>
          </>
        ) : (
          <p className="text-gray-500">No phrases due for review today. Come back tomorrow!</p>
        )}
        <Link
          href="/library"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  if (!current) return null;

  const nextReview = current.srs?.nextReview;
  const interval = current.srs?.interval;

  return (
    <div className="mx-auto max-w-md py-8 space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>Card {index + 1} of {queue.length}</span>
          <Link href="/library" className="hover:text-gray-700 transition">Exit</Link>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {/* Prompt — always visible */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Someone said:</p>
          <p className="text-base text-gray-800 font-medium">&ldquo;{current.prompt}&rdquo;</p>
        </div>

        {/* Response — hidden until revealed */}
        <div className="p-6">
          {revealed ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Your saved reply:</p>
              <p className="text-base text-gray-900 font-semibold mb-3">{current.text}</p>
              <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', TONE_STYLES[current.tone])}>
                {current.tone}
              </span>
              {interval && (
                <p className="mt-3 text-xs text-gray-400">
                  Next review in {interval} day{interval !== 1 ? 's' : ''} if you got it right.
                </p>
              )}
            </>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 py-6 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              Tap to reveal your reply
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {revealed && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAnswer(0)}
            className="rounded-xl border-2 border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
          >
            Missed it
          </button>
          <button
            onClick={() => handleAnswer(1)}
            className="rounded-xl border-2 border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
          >
            Got it
          </button>
        </div>
      )}

      {/* Due count chip */}
      <p className="text-center text-xs text-gray-400">
        {queue.length - index - 1} more to review today
      </p>
    </div>
  );
}
