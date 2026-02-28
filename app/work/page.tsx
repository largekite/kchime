'use client';

import { WorkReplyCard } from '@/components/work-reply/WorkReplyCard';
import { fetchWorkReplies } from '@/lib/claude';
import { getApiKey } from '@/lib/storage';
import { incrementWorkReplyCount } from '@/lib/storage';
import type { WorkplacePreset, WorkReplyResult } from '@/types';
import { useState } from 'react';

const PRESETS: { label: WorkplacePreset; icon: string }[] = [
  { label: 'Reply to Manager', icon: '👔' },
  { label: 'Reply to Direct Report', icon: '🤝' },
  { label: 'Reply to Client', icon: '💼' },
  { label: 'Push Back Politely', icon: '🛑' },
  { label: 'Deliver Constructive Feedback', icon: '💬' },
  { label: 'Escalate Issue Professionally', icon: '📢' },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
        <div className="h-3 w-4/6 rounded bg-gray-100" />
      </div>
      <div className="h-16 rounded-xl bg-gray-100" />
      <div className="mt-4 h-9 rounded-lg bg-gray-100" />
    </div>
  );
}

export default function WorkPage() {
  const [preset, setPreset] = useState<WorkplacePreset | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkReplyResult | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Connect your account in Settings to get started.');
      return;
    }
    if (!preset) {
      setError('Select a reply context above.');
      return;
    }
    if (!message.trim()) {
      setError('Paste the message you want to reply to.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await fetchWorkReplies(message.trim(), preset, apiKey);
      setResult(data);
      incrementWorkReplyCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Work Reply Optimizer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste any workplace message. Get 3 strategic replies with risk and tone analysis.
        </p>
      </div>

      {/* Preset selector */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-gray-700">Reply context</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setPreset(label)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                preset === label
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{icon}</span>
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message input */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Message to reply to</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the Slack message, email, feedback, or message you received..."
          rows={5}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none resize-none"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing…' : 'Analyze & Generate Replies'}
      </button>

      {/* Results */}
      {(loading || result) && (
        <div className="mt-8 space-y-5">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : result ? (
            <>
              <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide font-medium">
                <span>3 Strategic Variations</span>
                <span className="flex-1 border-t border-gray-100" />
                <span className="text-indigo-500">{preset}</span>
              </div>
              {result.variations.map((v, i) => (
                <WorkReplyCard
                  key={v.id}
                  variation={v}
                  isBest={i === result.bestChoiceIndex}
                />
              ))}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
