'use client';

import { aiConverse, converseDebrief, fetchRepliesStream, type ReplyPersonalization } from '@/lib/claude';
import { speakText, cancelSpeech } from '@/lib/speech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getToneProfile } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, RotateCcw, Lightbulb } from 'lucide-react';
import type { Context, Reply } from '@/types';

interface Persona {
  id: string;
  name: string;
  emoji: string;
  scene: string;
  opener: string;
  /** Matches a key in CONTEXT_CONFIG so hints use the right tone set. */
  context: Context;
}

const PERSONAS: Persona[] = [
  { id: 'barista', name: 'Barista', emoji: '☕', scene: 'Coffee shop order', opener: "Hey! What can I get started for you today?", context: 'Any' },
  { id: 'coworker', name: 'Coworker', emoji: '💼', scene: 'Monday morning chat', opener: "Hey, how was your weekend? Do anything fun?", context: 'Office' },
  { id: 'receptionist', name: 'Receptionist', emoji: '🏥', scene: 'Scheduling appointment', opener: "Good afternoon! How can I help you today?", context: 'Any' },
  { id: 'neighbor', name: 'Neighbor', emoji: '🏠', scene: 'Friendly hallway run-in', opener: "Oh hey! I keep meaning to ask — have you tried that new restaurant on the corner?", context: 'Text' },
  { id: 'interviewer', name: 'Job Interviewer', emoji: '👔', scene: 'Job interview', opener: "Great to meet you! Tell me a little bit about yourself.", context: 'Office' },
  { id: 'server', name: 'Restaurant Server', emoji: '🍽️', scene: 'Ordering food', opener: "Welcome in! Can I start you off with something to drink?", context: 'Any' },
];

interface Turn {
  speaker: 'ai' | 'user';
  text: string;
}

interface Debrief {
  highlight: string;
  tip: string;
  fluency: 'Excellent' | 'Good' | 'Keep practicing';
}

export default function ConverseTab() {
  const { plan, session, loading: authLoading } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPersona, _setSelectedPersona] = useState<Persona | null>(null);
  const selectedPersonaRef = useRef<Persona | null>(null);
  const setSelectedPersona = useCallback((p: Persona | null) => {
    selectedPersonaRef.current = p;
    _setSelectedPersona(p);
  }, []);
  const [history, setHistory] = useState<Turn[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const isAiSpeakingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);
  const [error, setError] = useState('');
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [isDebriefing, setIsDebriefing] = useState(false);
  const [hints, setHints] = useState<Reply[]>([]);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const abortRef = useRef(false);
  const startRef = useRef<() => void>(() => {});
  const stopRef = useRef<() => void>(() => {});

  // Helper to set both state (for UI) and ref (for stale-closure-safe guards)
  const setAiSpeaking = useCallback((value: boolean) => {
    isAiSpeakingRef.current = value;
    setIsAiSpeaking(value);
  }, []);

  const handleUserSpeech = useCallback(
    async (transcript: string) => {
      // Use refs for guards — the onSilence callback captures a stale closure,
      // so reading state directly would use an outdated value.
      const persona = selectedPersonaRef.current;
      if (!persona || isProcessingRef.current || isAiSpeakingRef.current) return;
      if (!transcript.trim()) return;

      isProcessingRef.current = true;
      abortRef.current = false;
      setIsProcessing(true);
      setHints([]);
      // Stop mic while processing + speaking so it doesn't silently drop speech
      stopRef.current();
      const userTurn: Turn = { speaker: 'user', text: transcript };
      let newHistory: Turn[] = [];
      setHistory((prev) => {
        newHistory = [...prev, userTurn];
        return newHistory;
      });

      try {
        const aiReply = await aiConverse(
          persona.name,
          newHistory.map((t) => ({ speaker: t.speaker, text: t.text })),
          transcript,
        );
        if (abortRef.current) return;
        const aiTurn: Turn = { speaker: 'ai', text: aiReply };
        setHistory((prev) => [...prev, aiTurn]);
        setAiSpeaking(true);
        speakText(aiReply, () => {
          setAiSpeaking(false);
          // Auto-resume listening after AI finishes speaking
          startRef.current();
        }, session?.access_token);
      } catch (e) {
        if (!abortRef.current) {
          setError(e instanceof Error ? e.message : 'Something went wrong.');
          // Restart mic on error since speakText won't run to do it
          startRef.current();
        }
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    },
    [setAiSpeaking, session],
  );

  const { isListening, isSupported, start, stop, transcript, reset } = useSpeechRecognition({
    onSilence: handleUserSpeech,
    silenceMs: 1800,
    continuous: true,
  });

  // Keep refs in sync so callbacks can use them without circular deps
  startRef.current = start;
  stopRef.current = stop;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  function handleSelectPersona(persona: Persona) {
    setSelectedPersona(persona);
    setHistory([{ speaker: 'ai', text: persona.opener }]);
    setError('');
    setDebrief(null);
    setHints([]);
    reset();
    setAiSpeaking(true);
    speakText(persona.opener, () => {
      setAiSpeaking(false);
      // Auto-start listening after the AI opener finishes
      if (isSupported) startRef.current();
    }, session?.access_token);
  }

  function handleReset() {
    abortRef.current = true;
    stop();
    cancelSpeech();
    setSelectedPersona(null);
    setHistory([]);
    setError('');
    setDebrief(null);
    setHints([]);
    reset();
    setAiSpeaking(false);
  }

  function handleToggleMic() {
    if (isListening) {
      stop();
    } else {
      setError('');
      start();
    }
  }

  async function handleFinishSession() {
    stop();
    cancelSpeech();
    setAiSpeaking(false);
    setIsDebriefing(true);
    try {
      const result = await converseDebrief(
        selectedPersona!.name,
        history.map((t) => ({ speaker: t.speaker, text: t.text })),
      );
      setDebrief(result);
    } catch {
      // Show debrief without AI feedback on error
      setDebrief({ highlight: 'Great effort!', tip: 'Keep practicing to build fluency.', fluency: 'Good' });
    } finally {
      setIsDebriefing(false);
    }
  }

  async function handleHint() {
    const lastAiTurn = [...history].reverse().find((t) => t.speaker === 'ai');
    if (!lastAiTurn || isLoadingHints) return;
    setIsLoadingHints(true);
    setHints([]);
    try {
      const collected: Reply[] = [];
      const tp = getToneProfile();
      const personalization: ReplyPersonalization = {
        toneProfile: {
          formality: tp.formality,
          lengthPreference: tp.lengthPreference,
          emojiEnabled: tp.emojiEnabled,
          customInstructions: tp.customInstructions,
        },
      };
      for await (const reply of fetchRepliesStream(lastAiTurn.text, selectedPersona?.context ?? 'Any', personalization)) {
        collected.push(reply);
        setHints([...collected]);
        if (collected.length >= 2) break;
      }
    } catch {
      // silently fail — hints are optional
    } finally {
      setIsLoadingHints(false);
    }
  }

  // Count user turns only — memoized so they don't recompute on unrelated re-renders
  const { userTurns, userWords } = useMemo(() => {
    const turns = history.filter((t) => t.speaker === 'user');
    return {
      userTurns: turns.length,
      userWords: turns.reduce((acc, t) => acc + t.text.trim().split(/\s+/).length, 0),
    };
  }, [history]);

  const fluencyColor: Record<string, string> = {
    'Excellent': 'text-emerald-600',
    'Good': 'text-indigo-600',
    'Keep practicing': 'text-amber-600',
  };

  // Pro gate
  if (!authLoading && plan === 'free') {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center space-y-4">
        <div className="text-4xl">🎙️</div>
        <p className="font-semibold text-gray-700 text-lg">AI Conversation Partner is a Pro feature</p>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          Have a real back-and-forth voice conversation with an AI barista, coworker, job interviewer, and more.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="mx-auto block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Upgrade to Pro — $7/mo
        </button>
        {showUpgrade && (
          <UpgradePrompt
            reason="AI Conversation Partner is available on Pro."
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
          <h1 className="text-2xl font-bold text-gray-900">AI Conversation Partner</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {selectedPersona
              ? `Chatting with ${selectedPersona.name} — ${selectedPersona.scene}`
              : 'Pick a persona and start a real voice conversation.'}
          </p>
        </div>
        {selectedPersona && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New chat
          </button>
        )}
      </div>

      {/* Persona picker */}
      {!selectedPersona && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-100 bg-white p-5 hover:border-indigo-300 hover:bg-indigo-50 transition group"
            >
              <span className="text-3xl">{persona.emoji}</span>
              <span className="font-semibold text-gray-800 text-sm group-hover:text-indigo-700">{persona.name}</span>
              <span className="text-xs text-gray-400 text-center leading-tight">{persona.scene}</span>
            </button>
          ))}
        </div>
      )}

      {/* Session debrief */}
      {debrief && selectedPersona && (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedPersona.emoji}</span>
            <div>
              <p className="font-bold text-gray-900">Session Complete</p>
              <p className="text-sm text-gray-400">{userTurns} exchange{userTurns !== 1 ? 's' : ''} · {userWords} words spoken</p>
            </div>
            <span className={clsx('ml-auto text-sm font-bold', fluencyColor[debrief.fluency] ?? 'text-gray-600')}>
              {debrief.fluency}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">What you did well</p>
              <p className="text-sm text-gray-800">{debrief.highlight}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Try next time</p>
              <p className="text-sm text-gray-800">{debrief.tip}</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Start new conversation
          </button>
        </div>
      )}

      {/* Conversation */}
      {selectedPersona && !debrief && (
        <>
          {!isSupported && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              Your browser doesn&apos;t support speech recognition. Try Chrome or Edge.
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="min-h-64 space-y-3 pb-2">
            {history.map((turn, i) => (
              <div
                key={i}
                className={clsx('flex gap-2.5', turn.speaker === 'user' ? 'justify-end' : 'justify-start')}
              >
                {turn.speaker === 'ai' && (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                    {selectedPersona.emoji}
                  </div>
                )}
                <div
                  className={clsx(
                    'max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    turn.speaker === 'ai'
                      ? 'rounded-tl-none bg-white border border-gray-100 shadow-sm text-gray-900'
                      : 'rounded-tr-none bg-indigo-600 text-white'
                  )}
                >
                  {turn.text}
                </div>
              </div>
            ))}

            {/* Live transcript */}
            {isListening && transcript && (
              <div className="flex justify-end gap-2.5">
                <div className="max-w-xs rounded-2xl rounded-tr-none bg-indigo-100 border border-indigo-200 px-4 py-2.5 text-sm text-indigo-700 italic">
                  {transcript}…
                </div>
              </div>
            )}

            {/* AI typing indicator */}
            {(isProcessing || isAiSpeaking) && (
              <div className="flex gap-2.5 items-start">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
                  {selectedPersona.emoji}
                </div>
                <div className="rounded-2xl rounded-tl-none bg-white border border-gray-100 shadow-sm px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Hint suggestions */}
          {hints.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hint — try saying something like:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {hints.map((hint) => (
                  <div key={hint.id} className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">{hint.tone}</p>
                    <p className="text-sm text-gray-900">{hint.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mic button + Hint + Finish session */}
          <div className="sticky bottom-6 flex flex-col items-center gap-3 pt-2">
            {/* Hint button — shown above mic, centered */}
            {history.length >= 1 && !isProcessing && !isAiSpeaking && (
              <button
                onClick={handleHint}
                disabled={isLoadingHints}
                className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition disabled:opacity-40"
                title="Need a hint?"
              >
                <Lightbulb className={clsx('h-3.5 w-3.5', isLoadingHints && 'animate-pulse')} />
                {isLoadingHints ? 'Loading hint…' : 'Hint'}
              </button>
            )}

            <div className="flex items-center">
              <button
                onClick={handleToggleMic}
                disabled={!isSupported || isProcessing || isAiSpeaking}
                className={clsx(
                  'h-16 w-16 rounded-full shadow-xl transition-all duration-200 flex items-center justify-center',
                  isListening
                    ? 'bg-red-500 shadow-red-300 scale-110'
                    : 'bg-indigo-600 shadow-indigo-300 hover:scale-105',
                  (!isSupported || isProcessing || isAiSpeaking) && 'opacity-40 cursor-not-allowed'
                )}
              >
                {isListening ? (
                  <MicOff className="h-7 w-7 text-white" />
                ) : (
                  <Mic className="h-7 w-7 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {isAiSpeaking ? `${selectedPersona.name} is speaking…` : isListening ? 'Listening…' : 'Tap to speak'}
            </p>

            {/* Finish session — shown after at least 2 user turns */}
            {userTurns >= 2 && !isProcessing && !isAiSpeaking && (
              <button
                onClick={handleFinishSession}
                disabled={isDebriefing}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
              >
                {isDebriefing ? 'Getting feedback…' : 'Finish session →'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
