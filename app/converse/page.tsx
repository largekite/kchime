'use client';

import { aiConverse, converseDebrief } from '@/lib/claude';
import { speakText } from '@/lib/speech';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAuth } from '@/context/AuthContext';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, RotateCcw } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  emoji: string;
  scene: string;
  opener: string;
}

const PERSONAS: Persona[] = [
  { id: 'barista', name: 'Barista', emoji: '☕', scene: 'Coffee shop order', opener: "Hey! What can I get started for you today?" },
  { id: 'coworker', name: 'Coworker', emoji: '💼', scene: 'Monday morning chat', opener: "Hey, how was your weekend? Do anything fun?" },
  { id: 'receptionist', name: 'Receptionist', emoji: '🏥', scene: 'Scheduling appointment', opener: "Good afternoon! How can I help you today?" },
  { id: 'neighbor', name: 'Neighbor', emoji: '🏠', scene: 'Friendly hallway run-in', opener: "Oh hey! I keep meaning to ask — have you tried that new restaurant on the corner?" },
  { id: 'interviewer', name: 'Job Interviewer', emoji: '👔', scene: 'Job interview', opener: "Great to meet you! Tell me a little bit about yourself." },
  { id: 'server', name: 'Restaurant Server', emoji: '🍽️', scene: 'Ordering food', opener: "Welcome in! Can I start you off with something to drink?" },
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

export default function ConversePage() {
  const { plan, loading: authLoading } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [debrief, setDebrief] = useState<Debrief | null>(null);
  const [isDebriefing, setIsDebriefing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleUserSpeech = useCallback(
    async (transcript: string) => {
      if (!selectedPersona || isProcessing || isAiSpeaking) return;
      if (!transcript.trim()) return;

      setIsProcessing(true);
      const userTurn: Turn = { speaker: 'user', text: transcript };
      const newHistory = [...history, userTurn];
      setHistory(newHistory);

      try {
        const aiReply = await aiConverse(
          selectedPersona.name,
          newHistory.map((t) => ({ speaker: t.speaker, text: t.text })),
          transcript,
        );
        const aiTurn: Turn = { speaker: 'ai', text: aiReply };
        setHistory((prev) => [...prev, aiTurn]);
        setIsAiSpeaking(true);
        speakText(aiReply, () => setIsAiSpeaking(false));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedPersona, history, isProcessing, isAiSpeaking],
  );

  const { isListening, isSupported, start, stop, transcript, reset } = useSpeechRecognition({
    onSilence: handleUserSpeech,
    silenceMs: 1800,
    continuous: true,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  function handleSelectPersona(persona: Persona) {
    setSelectedPersona(persona);
    setHistory([{ speaker: 'ai', text: persona.opener }]);
    setError('');
    setDebrief(null);
    reset();
    setIsAiSpeaking(true);
    speakText(persona.opener, () => setIsAiSpeaking(false));
  }

  function handleReset() {
    stop();
    window.speechSynthesis.cancel();
    setSelectedPersona(null);
    setHistory([]);
    setError('');
    setDebrief(null);
    reset();
    setIsAiSpeaking(false);
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
    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);
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

  // Count user turns only
  const userTurns = history.filter((t) => t.speaker === 'user').length;
  const userWords = history
    .filter((t) => t.speaker === 'user')
    .reduce((acc, t) => acc + t.text.trim().split(/\s+/).length, 0);

  const fluencyColor: Record<string, string> = {
    'Excellent': 'text-emerald-600',
    'Good': 'text-indigo-600',
    'Keep practicing': 'text-amber-600',
  };

  // Pro gate
  if (!authLoading && plan !== 'pro') {
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

          {/* Mic button + Finish session */}
          <div className="sticky bottom-6 flex flex-col items-center gap-3 pt-2">
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
