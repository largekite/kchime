'use client';

import { ContactSelector } from '@/components/shared/ContactSelector';
import { WorkReplyCard } from '@/components/work-reply/WorkReplyCard';
import { fetchWorkReplies, LimitReachedError, AuthRequiredError } from '@/lib/claude';
import { useContacts } from '@/hooks/useContacts';
import { incrementWorkReplyCount } from '@/lib/storage';
import type { WorkplacePreset, WorkReplyResult } from '@/types';
import { useCallback, useState } from 'react';
import { AuthModal } from '@/components/shared/AuthModal';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';

const PRESETS: { label: WorkplacePreset; hint: string }[] = [
  { label: 'Reply to Manager', hint: 'Respond to your boss or lead' },
  { label: 'Reply to Direct Report', hint: 'Respond to someone you manage' },
  { label: 'Reply to Client', hint: 'Respond to a customer or partner' },
  { label: 'Push Back Politely', hint: 'Say no without burning bridges' },
  { label: 'Deliver Constructive Feedback', hint: 'Give honest feedback kindly' },
  { label: 'Escalate Issue Professionally', hint: 'Raise a concern to leadership' },
];

/** Map contact relationship names to the closest preset. */
const REL_NAME_TO_PRESET: Record<string, WorkplacePreset> = {
  Boss: 'Reply to Manager',
  Client: 'Reply to Client',
};

/** Relationship-based presets that should be locked when a contact is selected. */
const RELATIONSHIP_PRESETS: Set<WorkplacePreset> = new Set([
  'Reply to Manager',
  'Reply to Direct Report',
  'Reply to Client',
]);

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
  const [showAuth, setShowAuth] = useState(false);

  /** When a contact is selected, auto-update the preset if there's a clear match. */
  const handleContactSelect = useCallback((id: string) => {
    setSelectedContactId(id);
    if (!id) return;
    const contact = contacts.find((c) => c.id === id);
    if (!contact?.relationshipId) return;
    const rel = relationships.find((r) => r.id === contact.relationshipId);
    if (rel) {
      const mapped = REL_NAME_TO_PRESET[rel.name];
      if (mapped) setPreset(mapped);
    }
  }, [contacts, relationships, setSelectedContactId]);

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
      if (err instanceof AuthRequiredError) {
        setShowAuth(true);
      } else if (err instanceof LimitReachedError) {
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
        <h1 className="text-2xl font-bold text-gray-900">Work Reply</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste a workplace message and pick a situation. You&apos;ll get 3 reply options from safe to bold.
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
              onSelect={handleContactSelect}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map(({ label, hint }) => {
            const locked = !!selectedContactId && RELATIONSHIP_PRESETS.has(label) && preset !== label;
            return (
              <button
                key={label}
                onClick={() => { if (!locked) setPreset(label); }}
                disabled={locked}
                title={locked ? 'Automatically set by your selected contact' : hint}
                className={`rounded-xl border px-3 py-2.5 text-left transition ${
                  preset === label
                    ? 'border-teal-500 bg-teal-50'
                    : locked
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className={`block text-sm font-medium ${
                  preset === label ? 'text-teal-700' : locked ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {label}
                </span>
                <span className={`block text-xs mt-0.5 ${
                  preset === label ? 'text-teal-500' : locked ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message input */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Message to reply to</p>
          {preset && (
            <span className="text-xs text-teal-600 font-medium">{preset}</span>
          )}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the Slack message, email, feedback, or message you received..."
          rows={5}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-500 focus:outline-none resize-none"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <span>3 Reply Options</span>
                <span className="flex-1 border-t border-gray-100" />
                <span className="text-teal-500">{preset}</span>
              </div>
              <p className="text-xs text-gray-400 -mt-3">Pick the tone that fits your situation. &ldquo;Recommended&rdquo; is usually safest.</p>
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
          reason="You've used your 1 free Work Reply for today. Upgrade for 8 per day."
          onClose={() => setShowUpgrade(false)}
        />
      )}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
