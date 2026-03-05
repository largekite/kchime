'use client';

import { allCategories, categoryMeta, getDailyPicks, getScenariosByCategory } from '@/lib/scenarios';
import { useProgress } from '@/hooks/useProgress';
import { getDailyGoal } from '@/lib/storage';
import Link from 'next/link';
import clsx from 'clsx';
import type { ScenarioCategory } from '@/types';

export default function PracticePage() {
  const { streak, completedScenarios, todayCount } = useProgress();
  const DAILY_GOAL = getDailyGoal();

  function getCompletionForCategory(cat: ScenarioCategory) {
    const all = getScenariosByCategory(cat);
    const done = all.filter((s) => completedScenarios.includes(s.id));
    return { done: done.length, total: all.length };
  }

  const dailyPicks = getDailyPicks();
  const goalPercent = Math.min((todayCount / DAILY_GOAL) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100">Daily Practice</p>
            <p className="mt-1 text-2xl font-bold">{todayCount}/{DAILY_GOAL} today</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-sm text-indigo-100">day streak</p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-white/20">
          <div
            className="h-2 rounded-full bg-white transition-all"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* Today's Picks */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900">Today&apos;s Picks</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {dailyPicks.map((scenario) => {
            const done = completedScenarios.includes(scenario.id);
            const meta = categoryMeta[scenario.category];
            return (
              <Link
                key={scenario.id}
                href={`/practice/${scenario.id}`}
                className={clsx(
                  'relative rounded-xl border p-4 transition hover:shadow-md',
                  done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 hover:border-indigo-200'
                )}
              >
                {done && (
                  <span className="absolute right-3 top-3 text-emerald-500 text-lg">✓</span>
                )}
                <p className="mt-2 font-semibold text-gray-900 text-sm leading-snug">{scenario.title}</p>
                <span className={clsx('mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium', meta.color)}>
                  {scenario.category}
                </span>
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{scenario.openingLine}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All categories */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900">All Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {allCategories.map((cat) => {
            const meta = categoryMeta[cat];
            const { done, total } = getCompletionForCategory(cat);
            const pct = Math.round((done / total) * 100);
            return (
              <Link
                key={cat}
                href={`/practice?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-4 rounded-xl bg-white border border-gray-100 p-4 hover:border-indigo-200 hover:shadow-md transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{cat}</p>
                  <p className="text-xs text-gray-400 mb-1.5">{done}/{total} completed</p>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400">{pct}%</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
