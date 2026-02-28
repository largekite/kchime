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
        <h2 className="mb-4 text-xl font-bold text-gray-900">Settings</h2>

        {hasExistingKey ? (
          <p className="mb-3 text-sm text-green-600 font-medium">Connected</p>
        ) : (
          <p className="mb-3 text-sm text-gray-500">Paste your access code to enable AI features.</p>
        )}
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={hasExistingKey ? 'Paste new code to update…' : 'Paste access code…'}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saved ? 'Saved!' : 'Save'}
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
