'use client';

import { useProgress } from '@/hooks/useProgress';
import { allCategories, categoryMeta, getScenariosByCategory, scenarios } from '@/lib/scenarios';
import { BADGES, BADGE_MAP, getDailyMultiplier } from '@/lib/gamification';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import clsx from 'clsx';
import type { DailyProgress, ScenarioCategory } from '@/types';
import { useRef, useCallback, useState } from 'react';
import { getDailyGoal, getStreakFreezes } from '@/lib/storage';

function ActivityHeatmap({ daily }: { daily: DailyProgress[] }) {
  // Build a map of date → count for the last 30 days
  const map = new Map(daily.map((d) => [d.date, d.scenariosCompleted]));

  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: map.get(key) ?? 0 });
  }

  function cellColor(count: number) {
    if (count === 0) return 'bg-gray-100';
    if (count <= 1) return 'bg-teal-200';
    if (count <= 3) return 'bg-teal-400';
    return 'bg-teal-600';
  }

  function shortDate(iso: string) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">30-Day Activity</h2>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Less</span>
          <span className="h-3 w-3 rounded-sm bg-gray-100" />
          <span className="h-3 w-3 rounded-sm bg-teal-200" />
          <span className="h-3 w-3 rounded-sm bg-teal-400" />
          <span className="h-3 w-3 rounded-sm bg-teal-600" />
          <span>More</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {days.map(({ date, count }) => (
          <div
            key={date}
            title={`${shortDate(date)}: ${count} scenario${count !== 1 ? 's' : ''}`}
            className={clsx('h-6 w-6 rounded-md transition-colors', cellColor(count))}
          />
        ))}
      </div>
    </div>
  );
}

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

export default function DashboardTab() {
  const { progress, streak, completedScenarios, todayCount, xp, levelInfo, earnedBadges } = useProgress();
  const shareRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);

  const last7 = getLast7Days();
  const chartData = last7.map((date) => {
    const entry = progress?.daily.find((d) => d.date === date);
    return { day: shortDay(date), count: entry?.scenariosCompleted ?? 0 };
  });

  const totalCompleted = completedScenarios.length;
  const totalScenarios = scenarios.length;

  function getCategoryStats(cat: ScenarioCategory) {
    const all = getScenariosByCategory(cat);
    const done = all.filter((s) => completedScenarios.includes(s.id)).length;
    return { done, total: all.length, pct: all.length > 0 ? Math.round((done / all.length) * 100) : 0 };
  }

  const DAILY_GOAL = getDailyGoal();
  const streakFreezes = getStreakFreezes();
  const { multiplier, label: multiplierLabel } = getDailyMultiplier(progress?.consecutiveDailyGoals ?? 0);

  const handleShare = useCallback(async () => {
    if (!shareRef.current) return;
    setSharing(true);
    setShareError(false);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(shareRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');

      // Try native share first (mobile)
      if (navigator.share && navigator.canShare) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'kchime-progress.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'My KChime Progress', files: [file] });
          return;
        }
      }

      // Fallback: download the image
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'kchime-progress.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setShareError(true);
        setTimeout(() => setShareError(false), 3000);
      }
    } finally {
      setSharing(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your conversation practice progress</p>
      </div>

      {/* Level + XP bar */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-teal-200 uppercase tracking-wider">Level {levelInfo.level}</p>
            <p className="text-xl font-bold">{levelInfo.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
            <p className="text-xs text-teal-200">Total XP</p>
            {multiplier > 1 && (
              <p className="text-xs font-bold text-yellow-300 mt-0.5">{multiplierLabel} XP Bonus Active</p>
            )}
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white/20">
          <div
            className="h-2.5 rounded-full bg-white transition-all"
            style={{ width: `${levelInfo.pct}%` }}
          />
        </div>
        {levelInfo.next && (
          <p className="text-xs text-teal-200 mt-1.5">
            {levelInfo.next - xp} XP to Level {levelInfo.level + 1} · {LEVEL_NAMES[levelInfo.level]}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-sm text-orange-100 mt-0.5">Day Streak</p>
          {streakFreezes > 0 && (
            <p className="text-xs text-orange-200 mt-1" title="Streak freezes protect your streak on missed days">
              {streakFreezes} freeze{streakFreezes !== 1 ? 's' : ''}
            </p>
          )}
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
        <div className="grid grid-cols-7 gap-2">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={earned ? `${badge.name}: ${badge.description}` : `Locked — ${badge.description}`}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl p-2 text-center transition cursor-default',
                  earned ? 'bg-teal-50 ring-1 ring-teal-100' : 'opacity-35 grayscale'
                )}
              >
                <span className="text-2xl leading-none" role="img" aria-label={badge.name}>{badge.emoji}</span>
                <p className="text-[10px] font-medium text-gray-700 leading-tight">{badge.name}</p>
                {earned && (
                  <span className="text-[9px] text-teal-500 font-semibold">+{badge.xpReward} XP</span>
                )}
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

      {/* 30-day heatmap */}
      <ActivityHeatmap daily={progress?.daily ?? []} />

      {/* Overall progress */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Overall Progress</h2>
          <span className="text-sm text-gray-400">{totalCompleted}/{totalScenarios}</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-100 mb-5">
          <div
            className="h-2.5 rounded-full bg-teal-500 transition-all"
            style={{ width: `${Math.round((totalCompleted / totalScenarios) * 100)}%` }}
          />
        </div>
        <div className="space-y-3">
          {allCategories.map((cat) => {
            const { done, total, pct } = getCategoryStats(cat);
            const meta = categoryMeta[cat];
            return (
              <div key={cat} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700 truncate">{cat}</p>
                    <p className="text-xs text-gray-400 ml-2 flex-shrink-0">{done}/{total}</p>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className={clsx('h-1.5 rounded-full transition-all', meta.color.includes('teal') ? 'bg-teal-400' : meta.color.includes('purple') ? 'bg-purple-400' : meta.color.includes('blue') ? 'bg-blue-400' : meta.color.includes('green') ? 'bg-green-400' : meta.color.includes('amber') ? 'bg-amber-400' : meta.color.includes('orange') ? 'bg-orange-400' : meta.color.includes('pink') ? 'bg-pink-400' : meta.color.includes('red') ? 'bg-red-400' : 'bg-yellow-400')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share card — inline styles required for html2canvas to render correctly */}
      <div ref={shareRef} style={{ fontFamily: 'system-ui, sans-serif', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '16px', padding: '24px', color: '#ffffff', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>KChime</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{streak}</p>
            <p style={{ fontSize: '12px', color: '#a5b4fc', margin: 0 }}>Day Streak</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{totalCompleted}</p>
            <p style={{ fontSize: '12px', color: '#a5b4fc', margin: 0 }}>Scenarios</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '30px', fontWeight: 700, margin: 0 }}>{xp}</p>
            <p style={{ fontSize: '12px', color: '#a5b4fc', margin: 0 }}>XP</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a5b4fc', margin: 0 }}>Level {levelInfo.level}</p>
            <p style={{ fontWeight: 700, margin: 0 }}>{levelInfo.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {earnedBadges.slice(0, 5).map((bid) => (
              <span key={bid} style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{BADGE_MAP[bid].name}</span>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#c7d2fe', marginTop: '12px', marginBottom: 0 }}>kchime.com · Practice English every day</p>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="w-full rounded-xl border-2 border-dashed border-teal-200 py-3 text-sm font-semibold text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {sharing ? 'Preparing…' : shareError ? 'Failed — try again' : 'Share My Progress'}
      </button>

      {/* Motivation */}
      {totalCompleted === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
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
