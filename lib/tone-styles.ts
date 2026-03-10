/** Centralized tone style definitions for all context-specific tones. */

export interface ToneStyle {
  bg: string;
  badge: string;
  border: string;
  color: string; // hex color for share cards
}

const TONE_MAP: Record<string, ToneStyle> = {
  // Any context
  Casual:       { bg: 'bg-indigo-50',  badge: 'bg-indigo-100 text-indigo-700',  border: 'border-indigo-200',  color: '#6366f1' },
  Funny:        { bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700',    border: 'border-amber-200',   color: '#f59e0b' },
  Warm:         { bg: 'bg-pink-50',    badge: 'bg-pink-100 text-pink-700',      border: 'border-pink-200',    color: '#ec4899' },
  Safe:         { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', color: '#10b981' },
  // Office context
  Professional: { bg: 'bg-slate-50',   badge: 'bg-slate-100 text-slate-700',    border: 'border-slate-200',   color: '#475569' },
  Diplomatic:   { bg: 'bg-sky-50',     badge: 'bg-sky-100 text-sky-700',        border: 'border-sky-200',     color: '#0ea5e9' },
  Confident:    { bg: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700',  border: 'border-violet-200',  color: '#8b5cf6' },
  Friendly:     { bg: 'bg-teal-50',    badge: 'bg-teal-100 text-teal-700',      border: 'border-teal-200',    color: '#14b8a6' },
  // Text context
  Chill:        { bg: 'bg-cyan-50',    badge: 'bg-cyan-100 text-cyan-700',      border: 'border-cyan-200',    color: '#06b6d4' },
  Witty:        { bg: 'bg-orange-50',  badge: 'bg-orange-100 text-orange-700',  border: 'border-orange-200',  color: '#f97316' },
  Hype:         { bg: 'bg-rose-50',    badge: 'bg-rose-100 text-rose-700',      border: 'border-rose-200',    color: '#f43f5e' },
  Sweet:        { bg: 'bg-fuchsia-50', badge: 'bg-fuchsia-100 text-fuchsia-700', border: 'border-fuchsia-200', color: '#d946ef' },
  // Party context
  Playful:      { bg: 'bg-yellow-50',  badge: 'bg-yellow-100 text-yellow-700',  border: 'border-yellow-200',  color: '#eab308' },
  Bold:         { bg: 'bg-red-50',     badge: 'bg-red-100 text-red-700',        border: 'border-red-200',     color: '#ef4444' },
  Energetic:    { bg: 'bg-lime-50',    badge: 'bg-lime-100 text-lime-700',      border: 'border-lime-200',    color: '#84cc16' },
  Smooth:       { bg: 'bg-purple-50',  badge: 'bg-purple-100 text-purple-700',  border: 'border-purple-200',  color: '#a855f7' },
  // Family context
  Gentle:       { bg: 'bg-blue-50',    badge: 'bg-blue-100 text-blue-700',      border: 'border-blue-200',    color: '#3b82f6' },
  Lighthearted: { bg: 'bg-amber-50',   badge: 'bg-amber-100 text-amber-700',    border: 'border-amber-200',   color: '#f59e0b' },
  Respectful:   { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', color: '#10b981' },
};

const FALLBACK: ToneStyle = {
  bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700', border: 'border-gray-200', color: '#6b7280',
};

export function getToneStyle(tone: string): ToneStyle {
  return TONE_MAP[tone] ?? FALLBACK;
}
