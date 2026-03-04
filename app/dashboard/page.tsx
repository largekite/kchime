'use client';

import { useProgress } from '@/hooks/useProgress';
import { allCategories, categoryMeta, getScenariosByCategory } from '@/lib/scenarios';
import { BADGES, BADGE_MAP } from '@/lib/gamification';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import clsx from 'clsx';
import type { ScenarioCategory } from '@/types';
import { useRef, useCallback } from 'react';

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function shortDay(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function DashboardPage() {
  const { progress, streak, completedScenarios, todayCount, xp, levelInfo, earnedBadges } = useProgress();
  const shareRef = useRef<HTMLDivElement>(null);

  const last7 = getLast7Days();
  const chartData = last7.map((date) => {
    const entry = progress?.daily.find((d) => d.date === date);
    return { day: shortDay(date), count: entry?.scenariosCompleted ?? 0 };
  });

  const totalCompleted = completedScenarios.length;
  const totalScenarios = 47;

  function getCategoryStats(cat: ScenarioCategory) {
    const all = getScenariosByCategory(cat);
    const done = all.filter((s) => completedScenarios.includes(s.id)).length;
    return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
  }

  const DAILY_GOAL = 3;

  const handleShare = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      if (!shareRef.current) return;
      const canvas = await html2canvas(shareRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kchime-progress.png';
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch {
      // fallback: just show the card
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your conversation practice progress</p>
      </div>

      {/* Level + XP bar */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Level {levelInfo.level}</p>
            <p className="text-xl font-bold">{levelInfo.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
            <p className="text-xs text-indigo-200">Total XP</p>
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/20">
          <div
            className="h-2.5 rounded-full bg-white transition-all"
            style={{ width: `${levelInfo.pct}%` }}
          />
        </div>
        {levelInfo.next && (
          <p className="text-xs text-indigo-200 mt-1.5">
            {levelInfo.next - xp} XP to Level {levelInfo.level + 1} · {LEVEL_NAMES[levelInfo.level]}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-sm text-orange-100 mt-0.5">Day Streak 🔥</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{totalCompleted}</p>
          <p className="text-sm text-gray-400 mt-0.5">Completed</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{todayCount}/{DAILY_GOAL}</p>
          <p className="text-sm text-gray-400 mt-0.5">Today&apos;s Goal</p>
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Badges</h2>
        <div className="grid grid-cols-5 gap-3">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={`${badge.name}: ${badge.description}`}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl p-2 text-center transition',
                  earned ? 'bg-indigo-50' : 'opacity-30 grayscale'
                )}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <p className="text-[10px] font-medium text-gray-700 leading-tight">{badge.name}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">{earnedBadges.length}/{BADGES.length} earned</p>
      </div>

      {/* 7-day chart */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Last 7 Days</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={(value: number | undefined) => [value ?? 0, 'Scenarios']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Overall Progress</h2>
          <span className="text-sm text-gray-400">{totalCompleted}/{totalScenarios}</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 mb-5">
          <div
            className="h-2.5 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${Math.round((totalCompleted / totalScenarios) * 100)}%` }}
          />
        </div>
        <div className="space-y-3">
          {allCategories.map((cat) => {
            const { done, total, pct } = getCategoryStats(cat);
            const meta = categoryMeta[cat];
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700 truncate">{cat}</p>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">{done}/{total}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className={clsx('h-1.5 rounded-full transition-all', meta.color.includes('indigo') ? 'bg-indigo-400' : meta.color.includes('purple') ? 'bg-purple-400' : meta.color.includes('blue') ? 'bg-blue-400' : meta.color.includes('green') ? 'bg-green-400' : meta.color.includes('amber') ? 'bg-amber-400' : meta.color.includes('orange') ? 'bg-orange-400' : meta.color.includes('pink') ? 'bg-pink-400' : meta.color.includes('red') ? 'bg-red-400' : 'bg-yellow-400')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share card (hidden, used for screenshot) */}
      <div ref={shareRef} className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-xl" style={{ fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex items-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/80" aria-hidden>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-bold text-sm text-white/80">KChime</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-xs text-indigo-200">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{totalCompleted}</p>
            <p className="text-xs text-indigo-200">Scenarios</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{xp}</p>
            <p className="text-xs text-indigo-200">XP</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-200">Level {levelInfo.level}</p>
            <p className="font-bold">{levelInfo.name}</p>
          </div>
          <div className="flex gap-1">
            {earnedBadges.slice(0, 5).map((bid) => (
              <span key={bid} className="text-xl">{BADGE_MAP[bid].emoji}</span>
            ))}
          </div>
        </div>
        <p className="text-xs text-indigo-300 mt-3">kchime.com · Practice English every day</p>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full rounded-xl border-2 border-dashed border-indigo-200 py-3 text-sm font-semibold text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Share My Progress
      </button>

      {/* Motivation */}
      {totalCompleted === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-700">No practice yet</p>
          <p className="text-sm text-gray-400 mt-1">Complete scenarios in Practice to see your stats here.</p>
        </div>
      )}
    </div>
  );
}

// Need LEVEL_NAMES accessible in JSX
const LEVEL_NAMES = [
  'Beginner', 'Learner', 'Conversant', 'Fluent', 'Confident',
  'Advanced', 'Articulate', 'Expert', 'Master', 'Legend',
];
