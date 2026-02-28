'use client';

import { getAccent, getApiKey, setAccent, setApiKey } from '@/lib/storage';
import { ACCENTS } from '@/lib/speech';
import type { AccentCode } from '@/types';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [accent, setAccentState] = useState<AccentCode>('en-US');

  useEffect(() => {
    if (open) {
      setKey('');
      setSaved(false);
      setHasExistingKey(!!getApiKey());
      setAccentState(getAccent());
    }
  }, [open]);

  function handleAccentChange(code: AccentCode) {
    setAccentState(code);
    setAccent(code);
  }

  function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    setSaved(true);
    setTimeout(onClose, 800);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-xl font-bold text-gray-900">Settings</h2>
        <p className="mb-5 text-sm text-gray-500">
          KChime uses your own Anthropic API key. Keys are stored locally and never sent to our servers.{' '}
          <a
            href="https://console.anthropic.com/account/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline"
          >
            Get a key →
          </a>
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Anthropic API Key
        </label>
        {hasExistingKey && (
          <p className="mb-2 text-xs text-green-600">A key is already configured. Enter a new key to replace it.</p>
        )}
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={hasExistingKey ? 'Enter new key to replace…' : 'sk-ant-...'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
        />

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Speak Accent
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.code}
                onClick={() => handleAccentChange(a.code)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  accent === a.code
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{a.flag}</span>
                <span>{a.label}</span>
                {accent === a.code && <span className="ml-auto text-indigo-500">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? 'Saved!' : 'Save Key'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
