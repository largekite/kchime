'use client';

import { evaluateResponse, continueConversation } from '@/lib/claude';
import { scorePronunciation } from '@/lib/pronunciation';
import type { PronunciationScore } from '@/lib/pronunciation';
import { getScenarioById, categoryMeta } from '@/lib/scenarios';
import { useProgress } from '@/hooks/useProgress';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { recordNaturalReply, getProgress } from '@/lib/storage';
import { getLevel, getDailyMultiplier } from '@/lib/gamification';
import { BadgeToast } from '@/components/BadgeToast';
import { LevelUpToast } from '@/components/LevelUpToast';
import { XpPopup } from '@/components/XpPopup';
import { use, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

type Step = 'choose' | 'custom' | 'evaluating' | 'result' | 'pronouncing' | 'continuing' | 'follow-up';

export default function ScenarioChatPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = use(params);
  const scenario = getScenarioById(scenarioId);

  const [step, setStep] = useState<Step>('choose');
  const [customReply, setCustomReply] = useState('');
  const [selectedReply, setSelectedReply] = useState('');
  const [evaluation, setEvaluation] = useState<{ natural: boolean; feedback: string; suggestion?: string } | null>(null);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  // XP / level-up feedback
  const [xpGained, setXpGained] = useState(0);
  const [showXp, setShowXp] = useState(false);
  const [levelUp, setLevelUp] = useState<{ level: number; name: string } | null>(null);
  const prevXpRef = useRef(0);

  // Pronunciation state
  const [pronunciationTarget, setPronunciationTarget] = useState('');
  const pronunciationTargetRef = useRef('');
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationScore | null>(null);

  // Multi-turn state
  const [turnHistory, setTurnHistory] = useState<{ speaker: 'other' | 'user'; text: string }[]>([]);
  const [followUpLine, setFollowUpLine] = useState('');
  const [turnCount, setTurnCount] = useState(0);

  const { completeScenario, completedScenarios, newBadges, dismissBadges, xp } = useProgress();
  const alreadyDone = completedScenarios.includes(scenarioId);

  // Speech recognition for pronunciation drill
  const handleSilence = useCallback((text: string) => {
    if (!text.trim()) return;
    setPronunciationScore(scorePronunciation(pronunciationTargetRef.current, text));
  }, []);

  const {
    isListening,
    isSupported: speechSupported,
    start: startMic,
    stop: stopMic,
    transcript,
    reset: resetTranscript,
  } = useSpeechRecognition({ onSilence: handleSilence, silenceMs: 1500 });

  if (!scenario) {
    notFound();
  }

  const meta = categoryMeta[scenario.category];

  async function handleContinueConversation() {
    setStep('continuing');
    const history: { speaker: 'other' | 'user'; text: string }[] = turnCount === 0
      ? [
          { speaker: 'other', text: scenario!.openingLine },
          { speaker: 'user', text: selectedReply },
        ]
      : [...turnHistory];

    try {
      const followUp = await continueConversation(scenario!.context, history);
      setFollowUpLine(followUp);
      setTurnHistory([...history, { speaker: 'other', text: followUp }]);
      setTurnCount((n) => n + 1);
      setStep('follow-up');
      setCustomReply('');
      setEvaluation(null);
    } catch {
      setStep('result');
    }
  }

  async function handleFollowUpReply(reply: string) {
    setSelectedReply(reply);
    setStep('evaluating');
    setError('');

    try {
      const result = await evaluateResponse(followUpLine, reply);
      setEvaluation(result);
      setTurnHistory((h) => [...h, { speaker: 'user', text: reply }]);
      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setStep('follow-up');
    }
  }

  async function handleReply(reply: string) {
    setSelectedReply(reply);
    setStep('evaluating');
    setError('');

    try {
      const prevLevel = getLevel(xp).level;
      prevXpRef.current = xp;

      const result = await evaluateResponse(scenario!.openingLine, reply);
      setEvaluation(result);
      setStep('result');

      let totalXpGained = 0;
      const currentProgress = getProgress();
      const { multiplier } = getDailyMultiplier(currentProgress.consecutiveDailyGoals ?? 0);

      if (!alreadyDone) {
        const updated = completeScenario(scenarioId);
        setCompleted(true);
        totalXpGained += Math.round(50 * multiplier);

        // Check level up
        const newLevel = getLevel(updated.xp ?? xp + 50);
        if (newLevel.level > prevLevel) {
          setLevelUp({ level: newLevel.level, name: newLevel.name });
        }
      }

      if (result.natural) {
        const { progress: naturalProgress } = recordNaturalReply();
        totalXpGained += 25;

        // Check level up after natural reply XP
        const newLevel = getLevel(naturalProgress.xp);
        const prevLvl = getLevel(prevXpRef.current).level;
        if (newLevel.level > prevLvl && !levelUp) {
          setLevelUp({ level: newLevel.level, name: newLevel.name });
        }
      }

      if (totalXpGained > 0) {
        setXpGained(totalXpGained);
        setShowXp(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not evaluate reply.');
      setStep('choose');
    }
  }

  function handleReset() {
    setStep('choose');
    setSelectedReply('');
    setCustomReply('');
    setEvaluation(null);
    setError('');
  }

  function handlePronounce(reply: string) {
    pronunciationTargetRef.current = reply;
    setPronunciationTarget(reply);
    setPronunciationScore(null);
    resetTranscript();
    setStep('pronouncing');
  }

  function handleMicToggle() {
    if (isListening) {
      stopMic();
      if (transcript.trim()) {
        setPronunciationScore(scorePronunciation(pronunciationTargetRef.current, transcript));
      }
    } else {
      setPronunciationScore(null);
      resetTranscript();
      startMic();
    }
  }

  function handlePronounceReset() {
    stopMic();
    setPronunciationScore(null);
    resetTranscript();
  }

  function handlePronounceBack() {
    stopMic();
    setPronunciationScore(null);
    resetTranscript();
    setStep('choose');
  }

  const scoreColor =
    pronunciationScore
      ? pronunciationScore.score >= 90
        ? 'text-emerald-600'
        : pronunciationScore.score >= 70
        ? 'text-amber-600'
        : 'text-red-500'
      : '';

  const scoreBg =
    pronunciationScore
      ? pronunciationScore.score >= 90
        ? 'bg-emerald-50 border-emerald-200'
        : pronunciationScore.score >= 70
        ? 'bg-amber-50 border-amber-200'
        : 'bg-red-50 border-red-200'
      : '';

  const scoreLabel =
    pronunciationScore
      ? pronunciationScore.score >= 90
        ? 'Excellent!'
        : pronunciationScore.score >= 70
        ? 'Pretty good!'
        : 'Keep practicing!'
      : '';

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Badge toast */}
      {newBadges.length > 0 && (
        <BadgeToast newBadges={newBadges} onDismiss={dismissBadges} />
      )}

      {/* Level-up toast */}
      {levelUp && (
        <LevelUpToast
          level={levelUp.level}
          levelName={levelUp.name}
          onDone={() => setLevelUp(null)}
        />
      )}

      {/* Back + category */}
      <div className="flex items-center gap-2">
        <Link href="/practice" className="text-sm text-gray-500 hover:text-gray-800 transition">
          ← Practice
        </Link>
        <span className="text-gray-300">/</span>
        <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', meta.color)}>
          {scenario.category}
        </span>
      </div>

      {/* Scenario card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{scenario.title}</p>
        <p className="text-sm text-gray-500 mb-3">{scenario.context}</p>

        {/* Opening line bubble */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <div className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
            <p className="text-sm font-medium text-gray-800">{scenario.openingLine}</p>
          </div>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Choose step */}
        {step === 'choose' && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">How would you reply?</p>
            {scenario.suggestedReplies.map((reply) => (
              <div key={reply} className="flex items-center gap-2">
                <button
                  onClick={() => handleReply(reply)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  {reply}
                </button>
                <button
                  onClick={() => handlePronounce(reply)}
                  title="Practice pronunciation"
                  className="flex-shrink-0 h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm6 9a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setStep('custom')}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-left text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              Write my own…
            </button>
          </div>
        )}

        {/* Custom reply step */}
        {step === 'custom' && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Write your own reply:</p>
            <textarea
              value={customReply}
              onChange={(e) => setCustomReply(e.target.value)}
              placeholder="Type your reply here…"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReply(customReply)}
                disabled={!customReply.trim()}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
              >
                Get Feedback
              </button>
              <button
                onClick={() => setStep('choose')}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Evaluating / continuing spinners */}
        {(step === 'evaluating' || step === 'continuing') && (
          <div className="flex items-center gap-3 py-4">
            <svg className="h-5 w-5 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">
              {step === 'continuing' ? 'Getting follow-up…' : 'Evaluating your reply…'}
            </p>
          </div>
        )}

        {/* Follow-up turn */}
        {step === 'follow-up' && followUpLine && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Turn {turnCount + 1}</p>

            {/* Follow-up bubble */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              </div>
              <div className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                <p className="text-sm font-medium text-gray-800">{followUpLine}</p>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            {/* Reply options */}
            <p className="text-sm font-medium text-gray-700">How would you reply?</p>
            <div className="space-y-2">
              {scenario!.suggestedReplies.slice(0, 3).map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleFollowUpReply(reply)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  {reply}
                </button>
              ))}
              <button
                onClick={() => setStep('custom')}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-left text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                Write my own…
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && evaluation && (
          <div className="space-y-3">
            {/* Your reply */}
            <div className="flex items-start gap-3 justify-end">
              <div className="rounded-2xl rounded-tr-none bg-indigo-600 px-4 py-3 max-w-xs">
                <p className="text-sm text-white">{selectedReply}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              </div>
            </div>

            {/* Evaluation card */}
            <div className={clsx(
              'rounded-xl p-4',
              evaluation.natural ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-800">
                  {evaluation.natural ? 'Sounds natural!' : 'Could be more natural'}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {showXp && (
                    <XpPopup amount={xpGained} onDone={() => setShowXp(false)} />
                  )}
                  {completed && !showXp && (
                    <span className="text-xs text-emerald-600 font-semibold">+1 practice</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700">{evaluation.feedback}</p>
              {evaluation.suggestion && (
                <div className="mt-2 rounded-lg bg-white/70 p-2.5">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Try this instead:</p>
                  <p className="text-sm text-gray-700 italic">&ldquo;{evaluation.suggestion}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Practice pronunciation of the reply */}
            <button
              onClick={() => handlePronounce(selectedReply)}
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm6 9a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z" />
              </svg>
              Practice saying this
            </button>

            {/* Actions */}
            <div className="flex gap-2 pt-1 flex-wrap">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Try again
              </button>
              {turnCount < 3 && (
                <button
                  onClick={handleContinueConversation}
                  className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  Continue conversation →
                </button>
              )}
              <Link
                href="/practice"
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                Next scenario →
              </Link>
            </div>
          </div>
        )}

        {/* Pronunciation drill */}
        {step === 'pronouncing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Say this out loud:</p>
              {!speechSupported && (
                <span className="text-xs text-amber-600">Speech not supported in this browser</span>
              )}
            </div>

            {/* Target phrase — plain before score, word-highlighted after */}
            <div className={clsx(
              'rounded-xl px-4 py-3 border',
              pronunciationScore ? 'bg-gray-50 border-gray-200' : 'bg-indigo-50 border-indigo-200'
            )}>
              {pronunciationScore ? (
                <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                  {pronunciationScore.targetWords.map((w, i) => (
                    <span
                      key={i}
                      className={clsx(
                        'text-sm font-medium',
                        w.matched ? 'text-emerald-600' : 'text-red-500'
                      )}
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-800">{pronunciationTarget}</p>
              )}
            </div>

            {/* Score badge */}
            {pronunciationScore && (
              <div className={clsx('flex items-center gap-3 rounded-xl p-3 border', scoreBg)}>
                <p className={clsx('text-3xl font-bold tabular-nums', scoreColor)}>
                  {pronunciationScore.score}%
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{scoreLabel}</p>
                  <p className="text-xs text-gray-500">
                    {pronunciationScore.targetWords.filter((w) => w.matched).length} of{' '}
                    {pronunciationScore.targetWords.length} words recognized
                  </p>
                </div>
              </div>
            )}

            {/* What the user said */}
            {transcript && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                <p className="text-xs text-gray-400 mb-0.5">You said:</p>
                <p className="text-sm text-gray-700 italic">&ldquo;{transcript}&rdquo;</p>
              </div>
            )}

            {/* Mic button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleMicToggle}
                disabled={!speechSupported}
                className={clsx(
                  'h-14 w-14 rounded-full shadow-lg transition-all duration-200',
                  isListening
                    ? 'bg-red-500 shadow-red-200 scale-110'
                    : 'bg-indigo-600 shadow-indigo-200 hover:scale-105',
                  !speechSupported && 'opacity-40 cursor-not-allowed'
                )}
                aria-label={isListening ? 'Stop recording' : 'Start recording'}
              >
                {isListening ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm6 9a1 1 0 0 1 1 1 7 7 0 0 1-6 6.92V21h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.08A7 7 0 0 1 5 12a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 0 1 1-1z" />
                  </svg>
                )}
              </button>
              <p className="text-xs text-gray-400">
                {isListening
                  ? 'Listening… tap to stop'
                  : pronunciationScore
                  ? 'Tap to record again'
                  : 'Tap mic to start'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {pronunciationScore && (
                <button
                  onClick={handlePronounceReset}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Try again
                </button>
              )}
              <button
                onClick={handlePronounceBack}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
