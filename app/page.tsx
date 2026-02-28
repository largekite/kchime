'use client';

import { ReplyCard } from '@/components/quick-reply/ReplyCard';
import { fetchReplies } from '@/lib/claude';
import { getApiKey } from '@/lib/storage';
import { useProgress } from '@/hooks/useProgress';
import { useSavedPhrases } from '@/hooks/useSavedPhrases';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { Context, Reply, SavedPhrase } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';

const CONTEXTS: Context[] = ['Any', 'Office', 'Text', 'Party', 'Family'];
const CONTEXT_ICONS: Record<Context, string> = {
  Any: '🌐',
  Office: '🏢',
  Text: '💬',
  Party: '🎉',
  Family: '🏠',
};

export default function QuickReplyPage() {
  const [input, setInput] = useState('');
  const [context, setContext] = useState<Context>('Any');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');

  const { recentPrompts, addPrompt } = useProgress();
  const { save: savePhrase } = useSavedPhrases();

  const { isListening, isSupported, start, stop, transcript } = useSpeechRecognition({
    onSilence: (t) => {
      setInput(t);
      stop();
    },
  });

  async function handleSubmit(promptText?: string) {
    const text = (promptText ?? input).trim();
    if (!text) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Add your Anthropic API key in Settings to get started.');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentPrompt(text);

    try {
      const result = await fetchReplies(text, context, apiKey);
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
                'rounded-full px-3 py-1 text-sm font-medium transition',
                context === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {CONTEXT_ICONS[c]} {c}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
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
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            {isListening && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
                <span className="text-xs text-red-500 font-medium">Listening…</span>
              </div>
            )}
          </div>

          {isSupported && (
            <button
              onClick={handleMic}
              className={clsx(
                'self-start rounded-xl p-3 transition',
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
              title={isListening ? 'Stop listening' : 'Speak'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v7a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1zm6 7a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z" />
              </svg>
            </button>
          )}
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
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold text-gray-700">What did someone say?</p>
          <p className="text-sm text-gray-400 mt-1">Type or speak a phrase and get 4 natural ways to reply.</p>
        </div>
      )}
    </div>
  );
}
