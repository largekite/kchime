'use client';

import Link from 'next/link';
import { REPLY_PACKS } from '@/lib/reply-packs';
import { Package } from 'lucide-react';

const COLOR_MAP: Record<string, { card: string; border: string; badge: string; icon: string }> = {
  teal: { card: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700', icon: 'text-teal-600' },
  indigo: { card: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-600' },
  violet: { card: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', icon: 'text-violet-600' },
  amber: { card: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
};

export default function ReplyPacksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reply Packs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse ready-made reply collections for everyday situations.
        </p>
      </div>

      {/* Pack cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {REPLY_PACKS.map((pack) => {
          const colors = COLOR_MAP[pack.color] ?? COLOR_MAP.teal;
          return (
            <Link
              key={pack.id}
              href={`/packs/${pack.id}`}
              className={`group rounded-2xl border p-5 transition hover:shadow-md ${colors.card} ${colors.border}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{pack.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition">
                    {pack.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 leading-snug">
                    {pack.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
                      {pack.examples.length} examples
                    </span>
                    <span className="text-xs text-gray-400">Tap to browse</span>
                  </div>
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
              Tap any example to generate fresh AI variations tailored to the situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
