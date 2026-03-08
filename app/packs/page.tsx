'use client';

import Link from 'next/link';
import { REPLY_PACKS } from '@/lib/reply-packs';
import { Package } from 'lucide-react';
import { useState } from 'react';

// Color mapping matches iOS PackCard accentColor logic
const COLOR_MAP: Record<string, { card: string; border: string; badge: string }> = {
  orange: { card: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  teal: { card: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700' },
  green: { card: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
  red: { card: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
};

export default function ReplyPacksPage() {
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
                <div className="mt-auto pt-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
                    {pack.scenarios.length} scenarios
                  </span>
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
