'use client';

import { useState } from 'react';
import { generateScenario } from '@/lib/claude';
import { saveCustomScenario, deleteCustomScenario, getCustomScenarios } from '@/lib/storage';
import type { CustomScenario, ScenarioCategory } from '@/types';
import { categoryMeta } from '@/lib/scenarios';
import clsx from 'clsx';
import Link from 'next/link';

function useCustomScenarios() {
  const [scenarios, setScenarios] = useState<CustomScenario[]>(() => getCustomScenarios());

  function add(s: CustomScenario) {
    saveCustomScenario(s);
    setScenarios(getCustomScenarios());
  }

  function remove(id: string) {
    deleteCustomScenario(id);
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  return { scenarios, add, remove };
}

export default function CustomPage() {
  const { scenarios, add, remove } = useCustomScenarios();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<CustomScenario | null>(null);

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const data = await generateScenario(input.trim());
      const scenario: CustomScenario = {
        id: `custom-${Date.now()}`,
        title: data.title,
        category: (data.category as ScenarioCategory) ?? 'Small Talk',
        openingLine: data.openingLine,
        context: data.context,
        suggestedReplies: data.suggestedReplies,
        createdAt: new Date().toISOString(),
        isCustom: true,
      };
      setPreview(scenario);
    } catch {
      setError('Could not generate a scenario. Try pasting a clearer conversation snippet.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!preview) return;
    add(preview);
    setPreview(null);
    setInput('');
    setError('');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Custom Scenarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste a real conversation you had — we'll turn it into a practice scenario.
        </p>
      </div>

      {/* Generator */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3">
        <p className="text-sm font-medium text-gray-700">Paste a real conversation or message:</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'e.g.\nCoworker: "You killed it in that meeting today!"\nMe: "Oh, thanks, I was so nervous"'}
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
        >
          {loading ? 'Generating…' : 'Generate scenario'}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-indigo-800">Preview</p>
            <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', categoryMeta[preview.category]?.color ?? 'bg-gray-100 text-gray-600')}>
              {preview.category}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">{preview.context}</p>
            <p className="text-sm font-semibold text-gray-900">&ldquo;{preview.openingLine}&rdquo;</p>
          </div>
          <div className="space-y-1">
            {preview.suggestedReplies.map((r, i) => (
              <p key={i} className="text-xs text-gray-600 rounded-lg bg-white/80 px-3 py-1.5">{r}</p>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Save & practice
            </button>
            <button
              onClick={() => setPreview(null)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Saved custom scenarios */}
      {scenarios.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">Your Scenarios</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {scenarios.map((s) => (
              <div key={s.id} className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium', categoryMeta[s.category]?.color ?? 'bg-gray-100 text-gray-600')}>
                    {s.category}
                  </span>
                  <button
                    onClick={() => remove(s.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{s.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">&ldquo;{s.openingLine}&rdquo;</p>
                <Link
                  href={`/practice/${s.id}`}
                  className="block w-full rounded-lg bg-indigo-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Practice
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {scenarios.length === 0 && !preview && (
        <p className="text-center text-sm text-gray-400 py-4">
          No custom scenarios yet. Paste a real conversation above to create one.
        </p>
      )}
    </div>
  );
}
