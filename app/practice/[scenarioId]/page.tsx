'use client';

import { evaluateResponse } from '@/lib/claude';
import { getScenarioById, categoryMeta } from '@/lib/scenarios';
import { useProgress } from '@/hooks/useProgress';
import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

type Step = 'choose' | 'custom' | 'evaluating' | 'result';

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

  const { completeScenario, completedScenarios } = useProgress();
  const alreadyDone = completedScenarios.includes(scenarioId);

  if (!scenario) {
    notFound();
  }

  const meta = categoryMeta[scenario.category];

  async function handleReply(reply: string) {
    setSelectedReply(reply);
    setStep('evaluating');
    setError('');

    try {
      const result = await evaluateResponse(scenario!.openingLine, reply);
      setEvaluation(result);
      setStep('result');
      if (!alreadyDone) {
        completeScenario(scenarioId);
        setCompleted(true);
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

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Back + category */}
      <div className="flex items-center gap-2">
        <Link href="/practice" className="text-sm text-gray-500 hover:text-gray-800 transition">
          ← Practice
        </Link>
        <span className="text-gray-300">/</span>
        <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', meta.color)}>
          {meta.icon} {scenario.category}
        </span>
      </div>

      {/* Scenario card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{scenario.title}</p>
        <p className="text-sm text-gray-500 mb-3">{scenario.context}</p>

        {/* Opening line bubble */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
            👤
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
            {scenario.suggestedReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleReply(reply)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 transition"
              >
                {reply}
              </button>
            ))}
            <button
              onClick={() => setStep('custom')}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 px-4 py-3 text-left text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              ✏️ Write my own…
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

        {/* Evaluating */}
        {step === 'evaluating' && (
          <div className="flex items-center gap-3 py-4">
            <svg className="h-5 w-5 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Evaluating your reply…</p>
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
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                🙋
              </div>
            </div>

            {/* Evaluation card */}
            <div className={clsx(
              'rounded-xl p-4',
              evaluation.natural ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
            )}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{evaluation.natural ? '✅' : '💡'}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {evaluation.natural ? 'Sounds natural!' : 'Could be more natural'}
                </span>
                {completed && <span className="ml-auto text-xs text-emerald-600 font-semibold">+1 practice</span>}
              </div>
              <p className="text-sm text-gray-700">{evaluation.feedback}</p>
              {evaluation.suggestion && (
                <div className="mt-2 rounded-lg bg-white/70 p-2.5">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Try this instead:</p>
                  <p className="text-sm text-gray-700 italic">&ldquo;{evaluation.suggestion}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Try again
              </button>
              <Link
                href="/practice"
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition"
              >
                Next scenario →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
