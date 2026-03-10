'use client';

import { fetchRepliesStream, explainPhrases, type ReplyPersonalization } from '@/lib/claude';
import { useSavedPhrases } from '@/hooks/useSavedPhrases';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getToneProfile } from '@/lib/storage';
import type { Context, ConversationRound, Reply, SavedPhrase } from '@/types';
import clsx from 'clsx';
import { useCallback, useRef, useState, useEffect } from 'react';
import { ReplyCard } from '@/components/quick-reply/ReplyCard';
import { useAuth } from '@/context/AuthContext';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';

const TONE_COLORS: Record<string, string> = {
  Casual: 'text-indigo-700',
  Funny: 'text-amber-700',
  Warm: 'text-pink-700',
  Safe: 'text-emerald-700',
};

export default function LiveTab() {
  const { plan, loading: authLoading } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [rounds, setRounds] = useState<ConversationRound[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [showExplain, setShowExplain] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState('');
  const { save: savePhrase } = useSavedPhrases();

  function getPersonalization(): ReplyPersonalization {
    const tp = getToneProfile();
    return {
      toneProfile: {
        formality: tp.formality,
        lengthPreference: tp.lengthPreference,
        emojiEnabled: tp.emojiEnabled,
        customInstructions: tp.customInstructions,
      },
    };
  }

  const handleSilence = useCallback(
    async (transcript: string) => {
      if (!autoMode || !transcript.trim() || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsProcessing(true);
      setLoading(true);
      const roundId = `round-${Date.now()}`;
      setRounds((prev) => [...prev, { id: roundId, transcript, replies: [] }]);
      resetTranscript();
      try {
        for await (const reply of fetchRepliesStream(transcript, 'Any', getPersonalization())) {
          setLoading(false);
          setRounds((prev) =>
            prev.map((r) => r.id === roundId ? { ...r, replies: [...r.replies, reply] } : r)
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error generating replies.');
      } finally {
        setLoading(false);
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [autoMode]
  );

  const { isListening, isSupported, start, stop, transcript, reset: resetTranscript } =
    useSpeechRecognition({
      onSilence: handleSilence,
      silenceMs: 1200,
      continuous: true,
    });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rounds, loading]);

  async function handleManualSend() {
    if (!transcript.trim() || isProcessing) return;
    setIsProcessing(true);
    setLoading(true);
    const text = transcript;
    const roundId = `round-${Date.now()}`;
    setRounds((prev) => [...prev, { id: roundId, transcript: text, replies: [] }]);
    resetTranscript();
    try {
      for await (const reply of fetchRepliesStream(text, 'Any', getPersonalization())) {
        setLoading(false);
        setRounds((prev) =>
          prev.map((r) => r.id === roundId ? { ...r, replies: [...r.replies, reply] } : r)
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error.');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  }

  async function handleExplainPhrases() {
    const lastRound = rounds[rounds.length - 1];
    if (!lastRound) return;
    setExplaining(true);
    try {
      const phrases = await explainPhrases(lastRound.transcript);
      setRounds((prev) =>
        prev.map((r, i) =>
          i === prev.length - 1 ? { ...r, phraseExplanations: phrases } : r
        )
      );
      setShowExplain(false);
    } catch {
      // ignore
    } finally {
      setExplaining(false);
    }
  }

  function handleToggleMic() {
    if (isListening) {
      stop();
    } else {
      setError('');
      start();
    }
  }

  function handleClear() {
    stop();
    setRounds([]);
    resetTranscript();
    setError('');
    setShowExplain(false);
  }

  // Pro gate — show upgrade wall if free and auth is resolved
  if (!authLoading && plan === 'free') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center space-y-4">
        <p className="font-semibold text-gray-700 text-lg">Live Listen is a Pro feature</p>
        <p className="text-sm text-gray-400">Upgrade to get real-time reply suggestions while you listen.</p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="mx-auto block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Upgrade to Pro — $7/mo
        </button>
        {showUpgrade && (
          <UpgradePrompt
            reason="Live Listen is available on Pro."
            onClose={() => setShowUpgrade(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Listen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Speak — get reply suggestions after 1 second of silence.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={rounds.length === 0 && !transcript}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Auto/Manual toggle */}
      <div className="flex items-center gap-3 rounded-xl bg-white p-3 border border-gray-100 shadow-sm">
        <span className="text-sm text-gray-600 font-medium">Mode:</span>
        <button
          onClick={() => setAutoMode(true)}
          className={clsx(
            'rounded-full px-3 py-1 text-sm font-medium transition',
            autoMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Auto
        </button>
        <button
          onClick={() => setAutoMode(false)}
          className={clsx(
            'rounded-full px-3 py-1 text-sm font-medium transition',
            !autoMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          Manual
        </button>
        <span className="text-xs text-gray-400 ml-auto">
          {autoMode ? 'Replies after 1s silence' : 'Press Send when ready'}
        </span>
      </div>

      {/* Not supported warning */}
      {!isSupported && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          Your browser doesn&apos;t support speech recognition. Try Chrome or Edge.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Conversation */}
      <div className="min-h-48 space-y-4">
        {rounds.length === 0 && !isListening && !transcript && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
            <p className="font-semibold text-gray-700">Start listening</p>
            <p className="text-sm text-gray-400 mt-1">Hit the mic button and start talking. KChime will suggest replies.</p>
          </div>
        )}

        {rounds.map((round, idx) => (
          <div key={round.id} className="space-y-2">
            {/* Transcript bubble */}
            <div className="flex items-start gap-2">
              <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              </div>
              <div className="rounded-2xl rounded-tl-none bg-white border border-gray-100 px-4 py-2.5 shadow-sm max-w-lg">
                <p className="text-sm text-gray-800">{round.transcript}</p>
              </div>
            </div>

            {/* Replies */}
            <div className="grid gap-2 sm:grid-cols-2 pl-9">
              {round.replies.slice(0, 2).map((reply: Reply) => (
                <div key={reply.id} className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                  <p className={clsx('text-xs font-semibold mb-1', TONE_COLORS[reply.tone] ?? 'text-gray-600')}>
                    {reply.tone}
                  </p>
                  <p className="text-sm text-gray-900">{reply.text}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(reply.text).catch(() => {});
                      setCopiedId(reply.id);
                      setTimeout(() => setCopiedId(''), 2000);
                    }}
                    className="mt-1.5 text-xs text-gray-400 hover:text-gray-700 transition"
                  >
                    {copiedId === reply.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
            {round.replies.length > 2 && (
              <div className="grid gap-2 sm:grid-cols-2 pl-9">
                {round.replies.slice(2).map((reply: Reply) => (
                  <div key={reply.id} className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                    <p className={clsx('text-xs font-semibold mb-1', TONE_COLORS[reply.tone] ?? 'text-gray-600')}>
                      {reply.tone}
                    </p>
                    <p className="text-sm text-gray-900">{reply.text}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(reply.text).catch(() => {})}
                      className="mt-1.5 text-xs text-gray-400 hover:text-gray-700 transition"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Phrase explanations */}
            {round.phraseExplanations && round.phraseExplanations.length > 0 && (
              <div className="pl-9 space-y-1.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phrases Explained</p>
                {round.phraseExplanations.map((p, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 p-2.5">
                    <span className="text-sm font-medium text-amber-800">&ldquo;{p.phrase}&rdquo;</span>
                    <span className="text-sm text-gray-600"> — {p.meaning}</span>
                    {p.tip && <p className="text-xs text-gray-400 mt-0.5">{p.tip}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Explain phrases button on last round */}
            {idx === rounds.length - 1 && !round.phraseExplanations && (
              <div className="pl-9">
                <button
                  onClick={() => { setShowExplain(true); handleExplainPhrases(); }}
                  disabled={explaining}
                  className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                >
                  {explaining ? 'Explaining…' : 'Explain phrases'}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Live transcript */}
        {(isListening || transcript) && (
          <div className="flex items-start gap-2">
            <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
            <div className="rounded-2xl rounded-tl-none bg-gray-50 border border-gray-200 px-4 py-2.5 max-w-lg">
              {transcript ? (
                <p className="text-sm text-gray-700">{transcript}</p>
              ) : (
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-red-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="pl-9 flex items-center gap-2 text-sm text-gray-400">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Mic button */}
      <div className="sticky bottom-6 flex items-center justify-center gap-4 pt-4">
        {!autoMode && transcript && (
          <button
            onClick={handleManualSend}
            disabled={isProcessing}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            Send →
          </button>
        )}
        <button
          onClick={handleToggleMic}
          disabled={!isSupported}
          className={clsx(
            'h-16 w-16 rounded-full shadow-xl transition-all duration-200',
            isListening
              ? 'bg-red-500 shadow-red-300 scale-110'
              : 'bg-indigo-600 shadow-indigo-300 hover:scale-105',
            !isSupported && 'opacity-40'
          )}
          aria-label={isListening ? 'Stop' : 'Start listening'}
        >
          {isListening ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm6 9a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
