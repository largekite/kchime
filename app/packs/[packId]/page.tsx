'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getPackById } from '@/lib/reply-packs';
import { fetchPackVariations } from '@/lib/claude';
import { ArrowLeft, Check, ChevronRight, Copy, Sparkles, X } from 'lucide-react';
import clsx from 'clsx';

const TONE_STYLES: Record<string, { bg: string; badge: string; border: string }> = {
  Casual: { bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700', border: 'border-teal-200' },
  Funny: { bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  Warm: { bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-200' },
  Safe: { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
};

export default function PackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packId = params.packId as string;
  const pack = getPackById(packId);

  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const [aiVariations, setAiVariations] = useState<{ tone: string; text: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!pack) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Pack not found.</p>
        <button onClick={() => router.push('/packs')} className="mt-4 text-teal-600 hover:underline text-sm">
          Back to Reply Packs
        </button>
      </div>
    );
  }

  const selectedExample = pack.examples.find((e) => e.id === selectedExampleId);

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleGenerateVariations(prompt: string) {
    setLoadingAi(true);
    setAiVariations([]);
    try {
      const variations = await fetchPackVariations(prompt);
      setAiVariations(variations);
    } catch {
      // Silently fail — seed replies are still available
    } finally {
      setLoadingAi(false);
    }
  }

  function handleSelectExample(exampleId: string) {
    if (selectedExampleId === exampleId) {
      setSelectedExampleId(null);
      setAiVariations([]);
    } else {
      setSelectedExampleId(exampleId);
      setAiVariations([]);
    }
  }

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.push('/packs')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          All Packs
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{pack.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pack.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pack.description}</p>
          </div>
        </div>
      </div>

      {/* Examples list */}
      <div className="space-y-3">
        {pack.examples.map((example) => {
          const isSelected = selectedExampleId === example.id;

          return (
            <div key={example.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm">
              {/* Example header — tappable */}
              <button
                onClick={() => handleSelectExample(example.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left transition hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400 mb-0.5">Someone says:</p>
                  <p className="text-base font-semibold text-gray-900 leading-snug">
                    &ldquo;{example.prompt}&rdquo;
                  </p>
                </div>
                <ChevronRight className={clsx(
                  'h-5 w-5 text-gray-400 flex-shrink-0 ml-3 transition-transform',
                  isSelected && 'rotate-90'
                )} />
              </button>

              {/* Expanded: seed replies + AI */}
              {isSelected && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                  {/* Seed replies */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Quick Replies
                    </p>
                    <div className="space-y-2">
                      {example.suggestedReplies.map((reply, i) => {
                        const copyId = `${example.id}-seed-${i}`;
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5 group"
                          >
                            <p className="flex-1 text-sm text-gray-800 leading-snug">{reply}</p>
                            <button
                              onClick={() => handleCopy(reply, copyId)}
                              className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-teal-600 transition"
                              title="Copy"
                            >
                              {copiedId === copyId ? (
                                <Check className="h-4 w-4 text-teal-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI variations */}
                  <div>
                    {aiVariations.length === 0 && !loadingAi && (
                      <button
                        onClick={() => handleGenerateVariations(example.prompt)}
                        className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition w-full justify-center"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate AI Variations
                      </button>
                    )}

                    {loadingAi && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                        ))}
                      </div>
                    )}

                    {aiVariations.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            AI Variations
                          </p>
                          <button
                            onClick={() => handleGenerateVariations(example.prompt)}
                            className="text-xs text-teal-600 hover:underline"
                          >
                            Regenerate
                          </button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {aiVariations.map((v, i) => {
                            const styles = TONE_STYLES[v.tone] ?? TONE_STYLES.Casual;
                            const copyId = `${example.id}-ai-${i}`;
                            return (
                              <div
                                key={i}
                                className={clsx('rounded-xl border p-3 transition', styles.bg, styles.border)}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', styles.badge)}>
                                    {v.tone}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(v.text, copyId)}
                                    className="rounded-md p-1 text-gray-400 hover:text-teal-600 transition"
                                    title="Copy"
                                  >
                                    {copiedId === copyId ? (
                                      <Check className="h-3.5 w-3.5 text-teal-600" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-sm font-medium text-gray-900 leading-snug">{v.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
