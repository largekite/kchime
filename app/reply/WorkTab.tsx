'use client';

import { ContactSelector } from '@/components/shared/ContactSelector';
import { WorkReplyCard } from '@/components/work-reply/WorkReplyCard';
import { fetchWorkReplies, LimitReachedError } from '@/lib/claude';
import { useContacts } from '@/hooks/useContacts';
import { incrementWorkReplyCount } from '@/lib/storage';
import type { WorkplacePreset, WorkReplyResult } from '@/types';
import { useState } from 'react';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';

const PRESETS: WorkplacePreset[] = [
  'Reply to Manager',
  'Reply to Direct Report',
  'Reply to Client',
  'Push Back Politely',
  'Deliver Constructive Feedback',
  'Escalate Issue Professionally',
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

export default function WorkTab() {
  const { contacts, relationships, selectedContactId, setSelectedContactId, getContactPersonalization } = useContacts();
  const [preset, setPreset] = useState<WorkplacePreset | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WorkReplyResult | null>(null);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function handleAnalyze() {
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
      const data = await fetchWorkReplies(message.trim(), preset, getContactPersonalization());
      setResult(data);
      incrementWorkReplyCount();
    } catch (err) {
      if (err instanceof LimitReachedError) {
        setShowUpgrade(true);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      }
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

      {/* Preset selector + contact — unified */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Reply context</p>
          {contacts.length > 0 && (
            <ContactSelector
              contacts={contacts}
              relationships={relationships}
              selectedContactId={selectedContactId}
              onSelect={setSelectedContactId}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map((label) => (
            <button
              key={label}
              onClick={() => setPreset(label)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                preset === label
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
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

      {showUpgrade && (
        <UpgradePrompt
          reason="You've used your 5 free Work Replies for today. Upgrade for 50 per day."
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
}
