'use client';

import Link from 'next/link';
import { REPLY_PACKS } from '@/lib/reply-packs';
import { getProgress } from '@/lib/storage';
import { Package } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

// Color mapping matches iOS PackCard accentColor logic
const COLOR_MAP: Record<string, { card: string; border: string; badge: string }> = {
  orange: { card: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  teal: { card: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700' },
  green: { card: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  red: { card: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
};

export default function PacksTab() {
  const viewedScenarios = typeof window !== 'undefined' ? (getProgress().viewedPackScenarios ?? []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reply Packs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pre-built message scenarios with instant replies. Tap a pack to explore.
        </p>
      </div>

      {/* Pack cards grid — matches iOS 2-column LazyVGrid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {REPLY_PACKS.map((pack) => {
          const colors = COLOR_MAP[pack.color] ?? COLOR_MAP.teal;
          const explored = pack.scenarios.filter((s) => viewedScenarios.includes(s.id)).length;
          const pct = Math.round((explored / pack.scenarios.length) * 100);
          return (
            <Link
              key={pack.id}
              href={`/packs/${pack.id}`}
              className={`group rounded-2xl border p-5 transition hover:shadow-md ${colors.card} ${colors.border}`}
            >
              <div className="flex flex-col h-full min-h-[140px]">
                <span className="text-3xl mb-2">{pack.emoji}</span>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition">
                  {pack.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600 leading-snug line-clamp-2">
                  {pack.description}
                </p>
                <div className="mt-auto pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
                      {pack.scenarios.length} scenarios
                    </span>
                    {explored > 0 && (
                      <span className="text-xs text-gray-400">{explored}/{pack.scenarios.length}</span>
                    )}
                  </div>
                  {explored > 0 && (
                    <div className="h-1 w-full rounded-full bg-black/5">
                      <div
                        className="h-1 rounded-full bg-teal-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">How Reply Packs work</p>
            <p className="text-sm text-gray-600 mt-1">
              Each pack contains real message scenarios with pre-written replies you can copy instantly.
              Tap any scenario to generate fresh AI variations tailored to the situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
