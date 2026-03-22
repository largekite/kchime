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

const riskHint: Record<string, string> = {
  Low: 'Safe and neutral — unlikely to cause friction.',
  Medium: 'Balanced — clear but with some assertiveness.',
  High: 'Bold and direct — may shift the dynamic.',
};

export function WorkReplyCard({ variation, isBest }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(variation.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
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
    <div className={`relative rounded-2xl border bg-white p-5 shadow-sm transition lg:p-7 lg:rounded-3xl ${isBest ? 'border-teal-400 ring-1 ring-teal-300' : 'border-gray-200'}`}>
      {isBest && (
        <span className="absolute -top-3 left-4 rounded-full bg-teal-600 px-3 py-0.5 text-xs font-semibold text-white shadow">
          Recommended
        </span>
      )}

      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-800 lg:text-base">{variation.label}</h3>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${riskColors[variation.risk]}`}>
          {variation.risk} risk
        </span>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-gray-700 lg:text-base lg:mb-4">{variation.text}</p>

      <p className="mb-4 text-xs text-gray-400">{riskHint[variation.risk]}</p>

      <button
        onClick={handleCopy}
        className="w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:bg-gray-100 lg:py-3 lg:text-base lg:rounded-xl"
      >
        {copied ? 'Copied!' : 'Copy Reply'}
      </button>
    </div>
  );
}
