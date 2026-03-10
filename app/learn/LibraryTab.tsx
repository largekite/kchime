'use client';

import { useSavedPhrases } from '@/hooks/useSavedPhrases';
import { ShareCardModal } from '@/components/shared/ShareCardModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/components/shared/Toast';
import type { Collection, SavedPhrase } from '@/types';
import { getToneStyle } from '@/lib/tone-styles';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import {
  getDueForReview, getCollections, createCollection,
  deleteCollection, togglePhraseInCollection,
} from '@/lib/storage';

function SrsChip({ srs }: { srs?: SavedPhrase['srs'] }) {
  const reps = srs?.repetitions ?? 0;
  if (reps === 0) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">New</span>;
  if (reps <= 2) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Learning</span>;
  if (reps <= 5) return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Mature</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Expert</span>;
}

export default function LibraryTab({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) {
  const { phrases, remove } = useSavedPhrases();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterTone, setFilterTone] = useState<string>('All');
  const [filterCollection, setFilterCollection] = useState<string | 'All'>('All');
  const [sharePhrase, setSharePhrase] = useState<SavedPhrase | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [confirmDeleteCol, setConfirmDeleteCol] = useState<string | null>(null);
  const [confirmDeletePhrase, setConfirmDeletePhrase] = useState<string | null>(null);

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newColName, setNewColName] = useState('');
  const [showNewCol, setShowNewCol] = useState(false);
  const [colMenuPhrase, setColMenuPhrase] = useState<string | null>(null); // phraseId whose menu is open
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Close collection dropdown on outside click
  useEffect(() => {
    if (!colMenuPhrase) return;
    function handleClick(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuPhrase(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [colMenuPhrase]);

  useEffect(() => {
    setDueCount(getDueForReview().length);
    setCollections(getCollections());
  }, [phrases]);

  // Derive tone filter options from saved phrases
  const uniqueTones = Array.from(new Set(phrases.map(p => p.tone)));
  const tones: string[] = ['All', ...uniqueTones];

  const filtered = phrases.filter((p) => {
    const matchTone = filterTone === 'All' || p.tone === filterTone;
    const matchSearch =
      !search ||
      p.text.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    const matchCollection =
      filterCollection === 'All' ||
      collections.find((c) => c.id === filterCollection)?.phraseIds.includes(p.id);
    return matchTone && matchSearch && matchCollection;
  });

  function handleExportCsv() {
    const header = 'Text,Tone,Context,Prompt,Saved,Next Review,Repetitions';
    const rows = phrases.map((p) => {
      const cols = [
        p.text, p.tone, p.context, p.prompt,
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
    try {
      await navigator.clipboard.writeText(phrase.text);
      setCopied(phrase.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard API may fail if page is not focused
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function handleCreateCollection() {
    if (!newColName.trim()) return;
    const col = createCollection(newColName);
    setCollections((prev) => [...prev, col]);
    setNewColName('');
    setShowNewCol(false);
    toast('Collection created');
  }

  function handleDeleteCollection(id: string) {
    deleteCollection(id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (filterCollection === id) setFilterCollection('All');
    toast('Collection deleted');
  }

  function handleTogglePhrase(collectionId: string, phraseId: string) {
    togglePhraseInCollection(collectionId, phraseId);
    setCollections(getCollections());
    setColMenuPhrase(null);
  }

  function isPhraseInCollection(colId: string, phraseId: string) {
    return collections.find((c) => c.id === colId)?.phraseIds.includes(phraseId) ?? false;
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
              <button
                onClick={() => onNavigate?.('review')}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                Review
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">{dueCount}</span>
              </button>
            )}
          </div>
        </div>

        {/* Collections row */}
        {phrases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collections</span>
              <button
                onClick={() => setFilterCollection('All')}
                className={clsx('rounded-full px-3 py-1 text-xs font-medium transition', filterCollection === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                All
              </button>
              {collections.map((col) => (
                <div key={col.id} className="flex items-center gap-0.5">
                  <button
                    onClick={() => setFilterCollection(col.id)}
                    className={clsx('rounded-l-full px-3 py-1 text-xs font-medium transition', filterCollection === col.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                  >
                    {col.name}
                    <span className="ml-1 opacity-60">{col.phraseIds.length}</span>
                  </button>
                  <button
                    onClick={() => setConfirmDeleteCol(col.id)}
                    className="rounded-r-full bg-gray-100 px-1.5 py-1 text-xs text-gray-400 hover:bg-red-100 hover:text-red-500 transition"
                    aria-label={`Delete ${col.name} collection`}
                    title="Delete collection"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowNewCol((v) => !v)}
                className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition"
              >
                + New
              </button>
            </div>

            {showNewCol && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCollection(); if (e.key === 'Escape') { setShowNewCol(false); setNewColName(''); } }}
                  placeholder="Collection name…"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                />
                <button onClick={handleCreateCollection} disabled={!newColName.trim()} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition">
                  Create
                </button>
              </div>
            )}
          </div>
        )}

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
                    filterTone === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                    <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', getToneStyle(phrase.tone).badge)}>
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

                <div className="mt-3 flex gap-1.5 flex-wrap">
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

                  {/* Collections dropdown */}
                  {collections.length > 0 && (
                    <div className="relative" ref={colMenuPhrase === phrase.id ? colMenuRef : undefined}>
                      <button
                        onClick={() => setColMenuPhrase(colMenuPhrase === phrase.id ? null : phrase.id)}
                        className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                      >
                        + Collection
                      </button>
                      {colMenuPhrase === phrase.id && (
                        <div className="absolute left-0 top-7 z-10 min-w-[140px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                          {collections.map((col) => {
                            const inCol = isPhraseInCollection(col.id, phrase.id);
                            return (
                              <button
                                key={col.id}
                                onClick={() => handleTogglePhrase(col.id, phrase.id)}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition"
                              >
                                <span className={clsx('h-3 w-3 rounded-sm border', inCol ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300')} />
                                {col.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setConfirmDeletePhrase(phrase.id)}
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

      {confirmDeleteCol && (
        <ConfirmDialog
          title="Delete collection?"
          message="Phrases in this collection won't be deleted, only the collection itself."
          onConfirm={() => {
            handleDeleteCollection(confirmDeleteCol);
            setConfirmDeleteCol(null);
          }}
          onCancel={() => setConfirmDeleteCol(null)}
        />
      )}

      {confirmDeletePhrase && (
        <ConfirmDialog
          title="Delete phrase?"
          message="This phrase will be permanently removed from your library."
          onConfirm={() => {
            remove(confirmDeletePhrase);
            toast('Phrase deleted');
            setConfirmDeletePhrase(null);
          }}
          onCancel={() => setConfirmDeletePhrase(null)}
        />
      )}
    </>
  );
}
