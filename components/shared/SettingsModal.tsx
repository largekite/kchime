'use client';

import { getApiKey, setApiKey, getDailyGoal, setDailyGoal, getAccent, setAccent } from '@/lib/storage';
import type { AccentCode } from '@/types';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const ACCENTS: { code: AccentCode; label: string; flag: string }[] = [
  { code: 'en-US', label: 'American', flag: '🇺🇸' },
  { code: 'en-GB', label: 'British', flag: '🇬🇧' },
  { code: 'en-AU', label: 'Australian', flag: '🇦🇺' },
  { code: 'en-IN', label: 'Indian', flag: '🇮🇳' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const { session } = useAuth();
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [goal, setGoal] = useState(3);
  const [goalSaved, setGoalSaved] = useState(false);
  const [accent, setAccentState] = useState<AccentCode>('en-US');
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [digestConfirmed, setDigestConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setKey('');
      setSaved(false);
      setGoalSaved(false);
      setHasExistingKey(!!getApiKey());
      setGoal(getDailyGoal());
      setAccentState(getAccent());
    }
  }, [open]);

  // Load current digest preference when modal opens with a session
  useEffect(() => {
    if (!open || !session) return;
    fetch('/api/email/preference', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((d: { weekly_digest?: boolean }) => setWeeklyDigest(d.weekly_digest ?? false))
      .catch(() => {});
  }, [open, session]);

  async function handleDigestToggle(enabled: boolean) {
    if (!session) return;
    setDigestSaving(true);
    setWeeklyDigest(enabled);
    setDigestConfirmed(false);
    try {
      await fetch('/api/email/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      setDigestConfirmed(true);
      setTimeout(() => setDigestConfirmed(false), 2000);
    } finally {
      setDigestSaving(false);
    }
  }

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

  function handleAccentChange(code: AccentCode) {
    setAccentState(code);
    setAccent(code);
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

        {/* Accent */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Voice Accent</label>
          <p className="text-xs text-gray-400">Sets the accent for text-to-speech playback.</p>
          <div className="grid grid-cols-2 gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.code}
                onClick={() => handleAccentChange(a.code)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  accent === a.code
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{a.flag}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
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

        {/* Weekly email digest — only shown when signed in */}
        {session && (
          <>
            <hr className="border-gray-100" />
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <label className="text-sm font-semibold text-gray-700">Weekly Recap Email</label>
                  <p className="text-xs text-gray-400 mt-0.5">Streak, XP &amp; practice summary every Monday.</p>
                  <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                </div>
                <button
                  role="switch"
                  aria-checked={weeklyDigest}
                  onClick={() => handleDigestToggle(!weeklyDigest)}
                  disabled={digestSaving}
                  className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${
                    weeklyDigest ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  {digestSaving ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    </span>
                  ) : (
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  )}
                </button>
              </div>
              {digestConfirmed && (
                <p className="text-xs font-medium text-indigo-600">
                  {weeklyDigest ? 'Subscribed — first email arrives Monday.' : 'Unsubscribed.'}
                </p>
              )}
            </div>
          </>
        )}

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
