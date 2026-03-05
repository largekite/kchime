'use client';

import { useSavedPhrases } from '@/hooks/useSavedPhrases';
import { ShareCardModal } from '@/components/shared/ShareCardModal';
import type { SavedPhrase, Tone } from '@/types';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { getDueForReview } from '@/lib/storage';
import Link from 'next/link';

const TONE_STYLES: Record<Tone, string> = {
  Casual: 'bg-indigo-100 text-indigo-700',
  Funny: 'bg-amber-100 text-amber-700',
  Warm: 'bg-pink-100 text-pink-700',
  Safe: 'bg-emerald-100 text-emerald-700',
};

function SrsChip({ srs }: { srs?: SavedPhrase['srs'] }) {
  const reps = srs?.repetitions ?? 0;
  if (reps === 0) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">New</span>;
  if (reps <= 2) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Learning</span>;
  if (reps <= 5) return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Mature</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Expert</span>;
}

export default function LibraryPage() {
  const { phrases, remove } = useSavedPhrases();
  const [search, setSearch] = useState('');
  const [filterTone, setFilterTone] = useState<Tone | 'All'>('All');
  const [sharePhrase, setSharePhrase] = useState<SavedPhrase | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    setDueCount(getDueForReview().length);
  }, [phrases]);

  const tones: (Tone | 'All')[] = ['All', 'Casual', 'Funny', 'Warm', 'Safe'];

  const filtered = phrases.filter((p) => {
    const matchTone = filterTone === 'All' || p.tone === filterTone;
    const matchSearch =
      !search ||
      p.text.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    return matchTone && matchSearch;
  });

  function handleExportCsv() {
    const header = 'Text,Tone,Context,Prompt,Saved,Next Review,Repetitions';
    const rows = phrases.map((p) => {
      const cols = [
        p.text,
        p.tone,
        p.context,
        p.prompt,
        p.savedAt.split('T')[0],
        p.srs?.nextReview ?? '',
        String(p.srs?.repetitions ?? 0),
      ].map((c) => `"${c.replace(/"/g, '""')}"`);
      return cols.join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kchime-phrases.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy(phrase: SavedPhrase) {
    await navigator.clipboard.writeText(phrase.text);
    setCopied(phrase.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Phrases</h1>
            <p className="text-sm text-gray-500 mt-1">{phrases.length} phrase{phrases.length !== 1 ? 's' : ''} saved</p>
          </div>
          <div className="flex items-center gap-2">
            {phrases.length > 0 && (
              <button
                onClick={handleExportCsv}
                title="Export phrases as CSV"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Export CSV
              </button>
            )}
            {dueCount > 0 && (
              <Link
                href="/review"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                Review
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">{dueCount}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        {phrases.length > 0 && (
          <div className="space-y-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phrases…"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="flex gap-2 flex-wrap">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTone(t)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-sm font-medium transition',
                    filterTone === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phrases grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((phrase) => (
              <div
                key={phrase.id}
                className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', TONE_STYLES[phrase.tone])}>
                      {phrase.tone}
                    </span>
                    <SrsChip srs={phrase.srs} />
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(phrase.savedAt)}</span>
                </div>

                <p className="text-sm font-medium text-gray-900 leading-snug mb-1">{phrase.text}</p>
                <p className="text-xs text-gray-400 truncate">
                  Re: &ldquo;{phrase.prompt}&rdquo;
                </p>

                <div className="mt-3 flex gap-1.5">
                  <button
                    onClick={() => handleCopy(phrase)}
                    className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    {copied === phrase.id ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setSharePhrase(phrase)}
                    className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    ↗ Share
                  </button>
                  <button
                    onClick={() => remove(phrase.id)}
                    className="ml-auto rounded-md px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : phrases.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <p className="font-semibold text-gray-700">No saved phrases yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Save replies from Quick Reply or Live Listen and they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            No phrases match your filters.
          </div>
        )}
      </div>

      {sharePhrase && (
        <ShareCardModal
          reply={{ id: sharePhrase.id, tone: sharePhrase.tone, text: sharePhrase.text }}
          prompt={sharePhrase.prompt}
          open={!!sharePhrase}
          onClose={() => setSharePhrase(null)}
        />
      )}
    </>
  );
}
