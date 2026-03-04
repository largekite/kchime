'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setOnboarded } from '@/lib/storage';
import clsx from 'clsx';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type GoalOption = 3 | 5 | 10;

const LEVELS: { value: Level; emoji: string; label: string; desc: string }[] = [
  { value: 'Beginner',     emoji: '🌱', label: 'Beginner',     desc: 'I struggle with everyday phrases' },
  { value: 'Intermediate', emoji: '🔥', label: 'Intermediate', desc: 'I get by but sound formal or awkward' },
  { value: 'Advanced',     emoji: '⚡', label: 'Advanced',     desc: 'I want to sound more natural & confident' },
];

const GOALS: { value: GoalOption; label: string; desc: string }[] = [
  { value: 3,  label: '3 scenarios / day', desc: 'Casual — 5 min a day' },
  { value: 5,  label: '5 scenarios / day', desc: 'Focused — 10 min a day' },
  { value: 10, label: '10 scenarios / day', desc: 'Intensive — 20 min a day' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level>('Intermediate');
  const [goal, setGoal] = useState<GoalOption>(3);

  function finish() {
    setOnboarded(level, goal);
    router.replace('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="rounded-3xl bg-indigo-600 p-5 shadow-xl shadow-indigo-200">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to KChime</h1>
              <p className="mt-3 text-gray-500 text-base leading-relaxed">
                Your AI-powered daily coach for sounding natural in American English conversations.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              {[['💬', 'Smart Replies'], ['🎯', 'Real Scenarios'], ['🔥', 'Daily Streaks']].map(([icon, label]) => (
                <div key={label} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="font-medium text-gray-700 text-xs">{label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              Get Started →
            </button>
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">Step 1 of 2</p>
              <h2 className="text-2xl font-bold text-gray-900">What&apos;s your current level?</h2>
              <p className="text-gray-500 text-sm mt-1">We&apos;ll tailor your experience accordingly.</p>
            </div>
            <div className="space-y-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={clsx(
                    'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition',
                    level === l.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-white hover:border-indigo-200'
                  )}
                >
                  <span className="text-3xl">{l.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{l.label}</p>
                    <p className="text-sm text-gray-500">{l.desc}</p>
                  </div>
                  {level === l.value && (
                    <span className="ml-auto text-indigo-600 text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Back
              </button>
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Daily goal */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">Step 2 of 2</p>
              <h2 className="text-2xl font-bold text-gray-900">Set your daily goal</h2>
              <p className="text-gray-500 text-sm mt-1">Consistency beats intensity. Pick what&apos;s realistic.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={clsx(
                    'w-full flex items-center justify-between rounded-xl border-2 p-4 text-left transition',
                    goal === g.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 bg-white hover:border-indigo-200'
                  )}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{g.label}</p>
                    <p className="text-sm text-gray-500">{g.desc}</p>
                  </div>
                  {goal === g.value && <span className="text-indigo-600 text-xl">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Back
              </button>
              <button onClick={finish} className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                Start Learning 🚀
              </button>
            </div>
          </div>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2].map((s) => (
            <div key={s} className={clsx('h-2 rounded-full transition-all', s === step ? 'w-6 bg-indigo-600' : 'w-2 bg-gray-200')} />
          ))}
        </div>

      </div>
    </div>
  );
}
