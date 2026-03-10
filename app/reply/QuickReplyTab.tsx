'use client';

import { ReplyCard } from '@/components/quick-reply/ReplyCard';
import { ContactSelector } from '@/components/shared/ContactSelector';
import { fetchReplies } from '@/lib/claude';
import type { ReplyPersonalization } from '@/lib/claude';
import { useContacts } from '@/hooks/useContacts';
import { useProgress } from '@/hooks/useProgress';
import { useSavedPhrases } from '@/hooks/useSavedPhrases';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getToneProfile } from '@/lib/storage';
import type { Context, Reply, SavedPhrase } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';
import { Briefcase, Home, MessageSquare, Music, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CONTEXTS: Context[] = ['Any', 'Office', 'Text', 'Party', 'Family'];
const CONTEXT_ICONS: Record<Context, LucideIcon> = {
  Any: Globe,
  Office: Briefcase,
  Text: MessageSquare,
  Party: Music,
  Family: Home,
};

export default function QuickReplyTab() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState<Context>('Any');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const { recentPrompts, addPrompt } = useProgress();
  const { save: savePhrase } = useSavedPhrases();
  const { contacts, relationships, selectedContactId, setSelectedContactId, getContactPersonalization } = useContacts();

  const { isListening, isSupported, start, stop, transcript, reset: resetTranscript } = useSpeechRecognition({
    onSilence: (t) => {
      setInput(t);
      stop();
      // Auto-submit after speech ends
      handleSubmit(t);
    },
  });

  async function handleSubmit(promptText?: string) {
    const text = (promptText ?? input).trim();
    if (!text) return;

    setLoading(true);
    setError('');
    setCurrentPrompt(text);

    try {
      // Build personalization from tone profile, selected contact, and relationship
      const toneProfile = getToneProfile();
      const personalization: ReplyPersonalization = {
        toneProfile: {
          formality: toneProfile.formality,
          lengthPreference: toneProfile.lengthPreference,
          emojiEnabled: toneProfile.emojiEnabled,
          customInstructions: toneProfile.customInstructions,
        },
        ...getContactPersonalization(),
      };

      const result = await fetchReplies(text, context, personalization);
      setReplies(result);
      addPrompt(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleMic() {
    if (isListening) {
      stop();
    } else {
      setInput('');
      start();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Reply</h1>
        <p className="text-sm text-gray-500 mt-1">Type what someone said — get 4 natural ways to respond.</p>
      </div>

      {/* Input area */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        {/* Context chips */}
        <div className="mb-3 flex gap-2 flex-wrap">
          {CONTEXTS.map((c) => (
            <button
              key={c}
              onClick={() => setContext(c)}
              className={clsx(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition',
                context === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {(() => { const Icon = CONTEXT_ICONS[c]; return <Icon className="h-3.5 w-3.5" />; })()}
              {c}
            </button>
          ))}
        </div>

        {/* Contact picker */}
        <div className="mb-3">
          <ContactSelector
            contacts={contacts}
            relationships={relationships}
            selectedContactId={selectedContactId}
            onSelect={setSelectedContactId}
          />
        </div>

        {/* Text input */}
        <div className="relative">
          <textarea
            value={isListening ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder='What did someone say? e.g. "TGIF, am I right?"'
            rows={2}
            autoComplete="off"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {/* Inline action: clear button or mic inside textarea */}
          {isListening ? (
            <button
              type="button"
              onClick={handleMic}
              className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-white shadow-sm transition hover:bg-red-600"
              title="Stop listening"
            >
              <span className="h-2 w-2 animate-ping rounded-full bg-white" />
              <span className="text-xs font-medium">Stop</span>
            </button>
          ) : (input || transcript) ? (
            <button
              type="button"
              onClick={() => { setInput(''); setError(''); resetTranscript(); }}
              className="absolute right-2.5 top-2.5 rounded-full p-0.5 text-gray-400 hover:text-gray-600 transition"
              title="Clear"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586L6.707 5.293a1 1 0 00-1.414 1.414L8.586 10l-3.293 3.293a1 1 0 101.414 1.414L10 11.414l3.293 3.293a1 1 0 001.414-1.414L11.414 10l3.293-3.293a1 1 0 00-1.414-1.414L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          ) : isSupported ? (
            <button
              type="button"
              onClick={handleMic}
              className="absolute right-2.5 top-2.5 rounded-full p-1 text-gray-300 hover:text-indigo-500 transition"
              title="Speak"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1zm6 7a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z" />
              </svg>
            </button>
          ) : null}
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={loading || (!input.trim() && !transcript.trim())}
          className="mt-3 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          {loading ? 'Generating replies…' : 'Get Replies'}
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Recent prompts */}
      {recentPrompts.length > 0 && replies.length === 0 && !loading && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recentPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(p);
                  handleSubmit(p);
                }}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 hover:border-indigo-300 hover:text-indigo-700 transition"
              >
                {p.length > 40 ? p.slice(0, 40) + '…' : p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      )}

      {/* Reply cards */}
      {!loading && replies.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Replies for: <span className="text-gray-600">&ldquo;{currentPrompt}&rdquo;</span>
            </p>
            <button
              onClick={() => handleSubmit(currentPrompt)}
              className="text-xs text-indigo-600 hover:underline"
            >
              Regenerate
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                prompt={currentPrompt}
                context={context}
                onSave={(phrase: SavedPhrase) => savePhrase(phrase)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && replies.length === 0 && recentPrompts.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
          <p className="font-semibold text-gray-700">What did someone say?</p>
          <p className="text-sm text-gray-400 mt-1">Type or speak a phrase and get 4 natural ways to reply.</p>
        </div>
      )}
    </div>
  );
}
