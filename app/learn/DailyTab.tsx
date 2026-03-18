'use client';

import { getPhraseOfTheDay, getRecentPhrases } from '@/lib/daily-phrases';
import { recordQuizCompletion, recordCulturalNoteRead } from '@/lib/storage';
import { XpPopup } from '@/components/XpPopup';
import { BadgeToast } from '@/components/BadgeToast';
import type { BadgeId, DailyPhrase } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, BookOpen, Volume2 } from 'lucide-react';
import { speakText } from '@/lib/speech';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_BADGE: Record<DailyPhrase['category'], { label: string; color: string }> = {
  idiom: { label: 'Idiom', color: 'bg-purple-100 text-purple-700' },
  slang: { label: 'Slang', color: 'bg-emerald-100 text-emerald-700' },
  filler: { label: 'Filler Phrase', color: 'bg-amber-100 text-amber-700' },
  cultural: { label: 'Cultural', color: 'bg-blue-100 text-blue-700' },
};

export default function DailyTab() {
  const { session } = useAuth();
  const todayPhrase = getPhraseOfTheDay();
  const recentPhrases = getRecentPhrases();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [quizXp, setQuizXp] = useState(0);
  const [showQuizXp, setShowQuizXp] = useState(false);
  const [quizBadges, setQuizBadges] = useState<BadgeId[]>([]);
  const [cultureExpanded, setCultureExpanded] = useState(false);
  const [cultureXp, setCultureXp] = useState(0);
  const [showCultureXp, setShowCultureXp] = useState(false);

  const quizAnswered = selectedAnswer !== null;
  const quizCorrect = selectedAnswer === todayPhrase.quiz.correctIndex;

  function handleQuizAnswer(index: number) {
    setSelectedAnswer(index);
    if (index === todayPhrase.quiz.correctIndex) {
      const result = recordQuizCompletion();
      if (result.xpAwarded > 0) {
        setQuizXp(result.xpAwarded);
        setShowQuizXp(true);
      }
      if (result.newBadges.length > 0) {
        setQuizBadges(result.newBadges);
      }
    }
  }

  function handleExpandCulture() {
    if (!cultureExpanded) {
      setCultureExpanded(true);
      const result = recordCulturalNoteRead();
      if (result.xpAwarded > 0) {
        setCultureXp(result.xpAwarded);
        setShowCultureXp(true);
      }
      if (result.newBadges.length > 0) {
        setQuizBadges((prev) => [...prev, ...result.newBadges]);
      }
    } else {
      setCultureExpanded(false);
    }
  }

  function handleSpeak(text: string) {
    speakText(text, () => {}, session?.access_token);
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {quizBadges.length > 0 && (
        <BadgeToast newBadges={quizBadges} onDismiss={() => setQuizBadges([])} />
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phrase of the Day</h1>
        <p className="text-sm text-gray-500 mt-1">Learn a new expression every day with cultural context.</p>
      </div>

      {/* Main phrase card */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-teal-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold', 'bg-white/20 text-white')}>
              {CATEGORY_BADGE[todayPhrase.category].label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">&ldquo;{todayPhrase.phrase}&rdquo;</h2>
            <button
              onClick={() => handleSpeak(todayPhrase.phrase)}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
              title="Listen to pronunciation"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-teal-100 text-sm">{todayPhrase.meaning}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Example */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Example</p>
            </div>
            <p className="text-sm text-gray-700 italic">{todayPhrase.example}</p>
            <button
              onClick={() => handleSpeak(todayPhrase.example.replace(/^"|"$/g, ''))}
              className="mt-2 text-xs text-teal-600 hover:underline flex items-center gap-1"
            >
              <Volume2 className="h-3 w-3" />
              Listen
            </button>
          </div>

          {/* Cultural note — tap to expand and earn XP */}
          <button
            onClick={handleExpandCulture}
            className="w-full text-left rounded-xl bg-amber-50 border border-amber-200 p-4 transition hover:border-amber-300"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex-1">Why Americans Say This</p>
              {showCultureXp && (
                <XpPopup amount={cultureXp} onDone={() => setShowCultureXp(false)} />
              )}
              {!cultureExpanded && !showCultureXp && (
                <span className="text-xs text-amber-500 font-medium">+5 XP</span>
              )}
              {cultureExpanded ? <ChevronUp className="h-4 w-4 text-amber-400" /> : <ChevronDown className="h-4 w-4 text-amber-400" />}
            </div>
            {cultureExpanded && (
              <p className="text-sm text-gray-700 leading-relaxed mt-2">{todayPhrase.culturalNote}</p>
            )}
          </button>

          {/* Quiz */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">{todayPhrase.quiz.question}</p>
            <div className="space-y-2">
              {todayPhrase.quiz.options.map((option, i) => (
                <button
                  key={option}
                  onClick={() => handleQuizAnswer(i)}
                  disabled={quizAnswered}
                  className={clsx(
                    'w-full text-left rounded-xl border px-4 py-2.5 text-sm transition',
                    quizAnswered && i === todayPhrase.quiz.correctIndex
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-medium'
                      : quizAnswered && i === selectedAnswer
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : quizAnswered
                      ? 'border-gray-200 bg-white text-gray-400'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            {quizAnswered && (
              <div className="mt-3 flex items-center gap-2">
                <p className={clsx('text-sm font-medium', quizCorrect ? 'text-emerald-700' : 'text-amber-700')}>
                  {quizCorrect ? 'Correct! You got it.' : 'Not quite — check the answer highlighted above.'}
                </p>
                {showQuizXp && (
                  <XpPopup amount={quizXp} onDone={() => setShowQuizXp(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archive toggle */}
      <button
        onClick={() => setShowArchive((v) => !v)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
      >
        {showArchive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showArchive ? 'Hide' : 'Show'} recent phrases
      </button>

      {/* Archive */}
      {showArchive && (
        <div className="space-y-2">
          {recentPhrases.slice(1).map(({ date, phrase }) => (
            <div
              key={`${date}-${phrase.phrase}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3"
            >
              <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_BADGE[phrase.category].color)}>
                {CATEGORY_BADGE[phrase.category].label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">&ldquo;{phrase.phrase}&rdquo;</p>
                <p className="text-xs text-gray-400">{phrase.meaning}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
