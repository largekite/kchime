'use client';

import type { WorkReplyVariation } from '@/types';
import { useState } from 'react';

interface Props {
  variation: WorkReplyVariation;
  isBest: boolean;
}

const riskColors = {
  Low: 'text-green-600 bg-green-50 border-green-200',
  Medium: 'text-amber-600 bg-amber-50 border-amber-200',
  High: 'text-red-600 bg-red-50 border-red-200',
};

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-teal-500 transition-all"
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-medium text-gray-600">{value}/10</span>
    </div>
  );
}

export function WorkReplyCard({ variation, isBest }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(variation.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for browsers that block clipboard API
      const ta = document.createElement('textarea');
      ta.value = variation.text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`relative rounded-2xl border bg-white p-5 shadow-sm transition ${isBest ? 'border-teal-400 ring-1 ring-teal-300' : 'border-gray-200'}`}>
      {isBest && (
        <span className="absolute -top-3 left-4 rounded-full bg-teal-600 px-3 py-0.5 text-xs font-semibold text-white shadow">
          Best Choice ✓
        </span>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">{variation.label}</h3>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${riskColors[variation.risk]}`}>
          Risk: {variation.risk}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-700">{variation.text}</p>

      <div className="mb-4 space-y-2 rounded-xl bg-gray-50 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Power Position</span>
          <span className="text-xs font-semibold text-gray-700">{variation.powerPosition}</span>
        </div>
        <Meter label="Assertiveness" value={variation.assertiveness} />
        <Meter label="Warmth" value={variation.warmth} />
      </div>

      <button
        onClick={handleCopy}
        className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:bg-gray-100"
      >
        {copied ? 'Copied!' : 'Copy Reply'}
      </button>
    </div>
  );
}
