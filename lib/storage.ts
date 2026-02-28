import type { AccentCode, Progress, SavedPhrase } from '@/types';

const KEYS = {
  API_KEY: 'kchime_api_key',
  PROGRESS: 'kchime_progress',
  SAVED_PHRASES: 'kchime_saved_phrases',
  WORK_REPLY_USAGE: 'kchime_work_reply_usage',
  ACCENT: 'kchime_accent',
} as const;

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// --- API Key ---

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(KEYS.API_KEY) ?? '';
}

export function setApiKey(key: string): void {
  localStorage.setItem(KEYS.API_KEY, key);
}

// --- Progress ---

const DEFAULT_PROGRESS: Progress = {
  completedScenarios: [],
  streak: 0,
  lastActiveDate: '',
  daily: [],
  recentPrompts: [],
};

export function getProgress(): Progress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    return JSON.parse(raw) as Progress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export function markScenarioComplete(scenarioId: string): Progress {
  const progress = getProgress();
  const today = getToday();

  if (!progress.completedScenarios.includes(scenarioId)) {
    progress.completedScenarios.push(scenarioId);
  }

  // Update daily count
  const todayEntry = progress.daily.find((d) => d.date === today);
  if (todayEntry) {
    todayEntry.scenariosCompleted += 1;
  } else {
    progress.daily.push({ date: today, scenariosCompleted: 1 });
    // Keep only last 30 days
    if (progress.daily.length > 30) {
      progress.daily = progress.daily.slice(-30);
    }
  }

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (progress.lastActiveDate === today) {
    // Already active today, streak stays
  } else if (progress.lastActiveDate === yesterdayStr) {
    progress.streak += 1;
  } else {
    progress.streak = 1;
  }
  progress.lastActiveDate = today;

  saveProgress(progress);
  return progress;
}

export function addRecentPrompt(prompt: string): void {
  const progress = getProgress();
  progress.recentPrompts = [
    prompt,
    ...progress.recentPrompts.filter((p) => p !== prompt),
  ].slice(0, 5);
  saveProgress(progress);
}

export function getTodayScenarioCount(): number {
  const progress = getProgress();
  const today = getToday();
  const entry = progress.daily.find((d) => d.date === today);
  return entry?.scenariosCompleted ?? 0;
}

// --- Saved Phrases ---

export function getSavedPhrases(): SavedPhrase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.SAVED_PHRASES);
    if (!raw) return [];
    return JSON.parse(raw) as SavedPhrase[];
  } catch {
    return [];
  }
}

export function savePhrase(phrase: SavedPhrase): void {
  const phrases = getSavedPhrases();
  phrases.unshift(phrase);
  localStorage.setItem(KEYS.SAVED_PHRASES, JSON.stringify(phrases));
}

export function deletePhrase(phraseId: string): void {
  const phrases = getSavedPhrases().filter((p) => p.id !== phraseId);
  localStorage.setItem(KEYS.SAVED_PHRASES, JSON.stringify(phrases));
}

// --- Work Reply Usage ---

interface WorkReplyUsage {
  date: string;
  count: number;
}

export function getWorkReplyUsage(): WorkReplyUsage {
  if (typeof window === 'undefined') return { date: getToday(), count: 0 };
  try {
    const raw = localStorage.getItem(KEYS.WORK_REPLY_USAGE);
    if (!raw) return { date: getToday(), count: 0 };
    const parsed = JSON.parse(raw) as WorkReplyUsage;
    if (parsed.date !== getToday()) return { date: getToday(), count: 0 };
    return parsed;
  } catch {
    return { date: getToday(), count: 0 };
  }
}

export function incrementWorkReplyCount(): void {
  const usage = getWorkReplyUsage();
  localStorage.setItem(KEYS.WORK_REPLY_USAGE, JSON.stringify({ date: getToday(), count: usage.count + 1 }));
}

// --- Accent ---

export function getAccent(): AccentCode {
  if (typeof window === 'undefined') return 'en-US';
  return (localStorage.getItem(KEYS.ACCENT) as AccentCode) ?? 'en-US';
}

export function setAccent(code: AccentCode): void {
  localStorage.setItem(KEYS.ACCENT, code);
}
