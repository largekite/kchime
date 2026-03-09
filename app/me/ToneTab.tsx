'use client';

import {
  getToneProfile, saveToneProfile, TONE_PRESETS,
  getAllRelationships, saveCustomRelationship, deleteCustomRelationship,
} from '@/lib/storage';
import type { ToneProfile, LengthPreference, RelationshipProfile } from '@/types';
import clsx from 'clsx';
import { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';

const LENGTH_OPTIONS: { value: LengthPreference; label: string; desc: string }[] = [
  { value: 'short', label: 'Brief', desc: 'Under 10 words' },
  { value: 'medium', label: 'Balanced', desc: '10–20 words' },
  { value: 'verbose', label: 'Detailed', desc: '20+ words' },
];

function formalityLabel(v: number): string {
  if (v < 0.3) return 'Casual';
  if (v <= 0.65) return 'Balanced';
  return 'Formal';
}

export default function ToneTab() {
  const [profile, setProfile] = useState<ToneProfile>(() => getToneProfile());
  const [saved, setSaved] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipProfile[]>(() => getAllRelationships());
  const [showNewRel, setShowNewRel] = useState(false);
  const [newRel, setNewRel] = useState({ name: '', emoji: '🙂' });

  function handleSave() {
    saveToneProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePreset(preset: ToneProfile) {
    const updated = { ...preset, id: profile.id, customInstructions: profile.customInstructions };
    setProfile(updated);
    saveToneProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAddRelationship() {
    if (!newRel.name.trim()) return;
    const rel: RelationshipProfile = {
      id: `rel-${Date.now()}`,
      name: newRel.name.trim(),
      emoji: newRel.emoji,
      formality: 5,
      warmth: 5,
      brevity: 5,
      directness: 5,
      emojiAllowed: false,
      isCustom: true,
    };
    saveCustomRelationship(rel);
    setRelationships(getAllRelationships());
    setNewRel({ name: '', emoji: '🙂' });
    setShowNewRel(false);
  }

  function handleDeleteRelationship(id: string) {
    deleteCustomRelationship(id);
    setRelationships(getAllRelationships());
  }

  function handleUpdateRelationship(id: string, field: keyof RelationshipProfile, value: number | boolean) {
    const all = getAllRelationships();
    const rel = all.find((r) => r.id === id);
    if (!rel || !rel.isCustom) return;
    const updated = { ...rel, [field]: value };
    saveCustomRelationship(updated);
    setRelationships(getAllRelationships());
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Tone</h1>
        <p className="text-sm text-gray-500 mt-1">Customize how KChime generates replies to match your personal style.</p>
      </div>

      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Presets</p>
        <div className="flex gap-2 flex-wrap">
          {TONE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                profile.label === preset.label
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formality slider */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Formality</label>
            <span className="text-xs font-semibold text-indigo-600">{formalityLabel(profile.formality)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={profile.formality}
            onChange={(e) => setProfile({ ...profile, formality: parseFloat(e.target.value) })}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Casual</span>
            <span>Formal</span>
          </div>
        </div>

        {/* Length preference */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Reply Length</label>
          <div className="grid grid-cols-3 gap-2">
            {LENGTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setProfile({ ...profile, lengthPreference: opt.value })}
                className={clsx(
                  'rounded-xl border p-3 text-center transition',
                  profile.lengthPreference === opt.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                )}
              >
                <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Emoji toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Include emojis</p>
            <p className="text-xs text-gray-400">Allow emojis in generated replies</p>
          </div>
          <button
            onClick={() => setProfile({ ...profile, emojiEnabled: !profile.emojiEnabled })}
            className={clsx(
              'relative h-6 w-11 rounded-full transition-colors',
              profile.emojiEnabled ? 'bg-indigo-600' : 'bg-gray-200'
            )}
          >
            <span
              className={clsx(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                profile.emojiEnabled && 'translate-x-5'
              )}
            />
          </button>
        </div>

        {/* Custom instructions */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Custom Instructions</label>
          <p className="text-xs text-gray-400 mb-2">Optional notes about how you like to communicate.</p>
          <textarea
            value={profile.customInstructions ?? ''}
            onChange={(e) => setProfile({ ...profile, customInstructions: e.target.value || undefined })}
            placeholder="e.g., I prefer shorter replies, I avoid sarcasm, I like to be encouraging..."
            rows={3}
            maxLength={300}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {(profile.customInstructions?.length ?? 0)}/300
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Tone Profile'
          )}
        </button>
      </div>

      {/* Relationship Profiles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Relationship Profiles</h2>
            <p className="text-xs text-gray-400">Adjust tone per relationship — replies adapt automatically.</p>
          </div>
          <button
            onClick={() => setShowNewRel(true)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* New relationship form */}
        {showNewRel && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 mb-3 space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={newRel.emoji}
                onChange={(e) => setNewRel({ ...newRel, emoji: e.target.value.slice(-2) })}
                className="w-12 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-lg"
                maxLength={2}
              />
              <input
                value={newRel.name}
                onChange={(e) => setNewRel({ ...newRel, name: e.target.value })}
                placeholder="e.g., Roommate"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                autoFocus
              />
              <button
                onClick={handleAddRelationship}
                disabled={!newRel.name.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
              >
                Add
              </button>
              <button
                onClick={() => setShowNewRel(false)}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {relationships.map((rel) => (
            <div key={rel.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{rel.emoji}</span>
                <span className="font-semibold text-gray-800 text-sm">{rel.name}</span>
                {rel.isCustom && (
                  <button
                    onClick={() => handleDeleteRelationship(rel.id)}
                    className="ml-auto text-gray-400 hover:text-red-500 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { key: 'formality' as const, label: 'Formality', lo: 'Casual', hi: 'Formal' },
                  { key: 'warmth' as const, label: 'Warmth', lo: 'Distant', hi: 'Warm' },
                  { key: 'brevity' as const, label: 'Brevity', lo: 'Long', hi: 'Brief' },
                  { key: 'directness' as const, label: 'Directness', lo: 'Gentle', hi: 'Direct' },
                ].map(({ key, label, lo, hi }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-medium text-gray-700">{rel[key]}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={rel[key]}
                      disabled={!rel.isCustom}
                      onChange={(e) => handleUpdateRelationship(rel.id, key, parseInt(e.target.value))}
                      className="w-full accent-indigo-600 disabled:opacity-50"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 -mt-0.5">
                      <span>{lo}</span>
                      <span>{hi}</span>
                    </div>
                  </div>
                ))}
              </div>
              {rel.isCustom && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-500">Allow emojis</span>
                  <button
                    onClick={() => handleUpdateRelationship(rel.id, 'emojiAllowed', !rel.emojiAllowed)}
                    className={clsx(
                      'relative h-5 w-9 rounded-full transition-colors',
                      rel.emojiAllowed ? 'bg-indigo-600' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                        rel.emojiAllowed && 'translate-x-4'
                      )}
                    />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
