'use client';

import { getApiKey, setApiKey } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (open) {
      setKey('');
      setSaved(false);
      setHasExistingKey(!!getApiKey());
    }
  }, [open]);

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

        <div className="mt-4 flex gap-2">
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
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
