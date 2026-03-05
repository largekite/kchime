'use client';

import { getApiKey, setApiKey, getDailyGoal, setDailyGoal } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [goal, setGoal] = useState(3);
  const [goalSaved, setGoalSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setKey('');
      setSaved(false);
      setGoalSaved(false);
      setHasExistingKey(!!getApiKey());
      setGoal(getDailyGoal());
    }
  }, [open]);

  function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    setSaved(true);
    setTimeout(onClose, 800);
  }

  function handleGoalSave() {
    setDailyGoal(goal);
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 1500);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>

        {/* Daily Goal */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Daily Practice Goal</label>
          <p className="text-xs text-gray-400">How many scenarios do you want to complete each day?</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={goal}
              onChange={(e) => { setGoal(Number(e.target.value)); setGoalSaved(false); }}
              className="flex-1 accent-indigo-600"
            />
            <span className="w-8 text-center text-sm font-bold text-gray-800">{goal}</span>
          </div>
          <button
            onClick={handleGoalSave}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            {goalSaved ? 'Saved!' : 'Update goal'}
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Access code */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Access Code</label>
          {hasExistingKey ? (
            <p className="text-sm text-green-600 font-medium">Connected</p>
          ) : (
            <p className="text-sm text-gray-500">Paste your access code to enable AI features.</p>
          )}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasExistingKey ? 'Paste new code to update…' : 'Paste access code…'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
