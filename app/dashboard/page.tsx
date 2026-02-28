'use client';

import { useProgress } from '@/hooks/useProgress';
import { allCategories, categoryMeta, getScenariosByCategory } from '@/lib/scenarios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import clsx from 'clsx';
import type { ScenarioCategory } from '@/types';

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
  const { progress, streak, completedScenarios, todayCount } = useProgress();

  const last7 = getLast7Days();
  const chartData = last7.map((date) => {
    const entry = progress?.daily.find((d) => d.date === date);
    return {
      day: shortDay(date),
      count: entry?.scenariosCompleted ?? 0,
    };
  });

  const totalCompleted = completedScenarios.length;
  const totalScenarios = 47; // all scenarios count

  function getCategoryStats(cat: ScenarioCategory) {
    const all = getScenariosByCategory(cat);
    const done = all.filter((s) => completedScenarios.includes(s.id)).length;
    return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
  }

  const DAILY_GOAL = 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your conversation practice progress</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 text-white shadow-sm">
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-sm text-indigo-100 mt-0.5">Day Streak 🔥</p>
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

      {/* 7-day chart */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Last 7 Days</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={28}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
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

        {/* Category breakdown */}
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

      {/* Motivation */}
      {totalCompleted === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-700">No practice yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Complete scenarios in Practice to see your stats here.
          </p>
        </div>
      )}
    </div>
  );
}
