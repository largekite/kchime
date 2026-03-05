import type { AccentCode, BadgeId, CustomScenario, Progress, SavedPhrase } from '@/types';
import { checkNewBadges, BADGE_MAP } from '@/lib/gamification';

const KEYS = {
  API_KEY: 'kchime_api_key',
  PROGRESS: 'kchime_progress',
  SAVED_PHRASES: 'kchime_saved_phrases',
  WORK_REPLY_USAGE: 'kchime_work_reply_usage',
  ACCENT: 'kchime_accent',
  ONBOARDED: 'kchime_onboarded',
  ONBOARD_LEVEL: 'kchime_onboard_level',
  ONBOARD_GOAL: 'kchime_onboard_goal',
  CUSTOM_SCENARIOS: 'kchime_custom_scenarios',
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

// --- Onboarding ---

export function isOnboarded(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(KEYS.ONBOARDED) === 'true';
}

export function setOnboarded(level: string, goal: number): void {
  localStorage.setItem(KEYS.ONBOARDED, 'true');
  localStorage.setItem(KEYS.ONBOARD_LEVEL, level);
  localStorage.setItem(KEYS.ONBOARD_GOAL, String(goal));
}

export function getDailyGoal(): number {
  if (typeof window === 'undefined') return 3;
  return parseInt(localStorage.getItem(KEYS.ONBOARD_GOAL) ?? '3', 10);
}

export function setDailyGoal(goal: number): void {
  localStorage.setItem(KEYS.ONBOARD_GOAL, String(goal));
}

// --- Progress ---

const DEFAULT_PROGRESS: Progress = {
  completedScenarios: [],
  streak: 0,
  lastActiveDate: '',
  daily: [],
  recentPrompts: [],
  xp: 0,
  earnedBadges: [],
  naturalReplies: 0,
  streakFreezes: 0,
};

export function getProgress(): Progress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(KEYS.PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    // Merge with defaults to handle old data
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
}

export function markScenarioComplete(scenarioId: string): { progress: Progress; newBadges: BadgeId[] } {
  const progress = getProgress();
  const today = getToday();

  const isNew = !progress.completedScenarios.includes(scenarioId);
  if (isNew) {
    progress.completedScenarios.push(scenarioId);
    progress.xp += 50; // 50 XP per new scenario
  }

  // Update daily count
  const todayEntry = progress.daily.find((d) => d.date === today);
  if (todayEntry) {
    todayEntry.scenariosCompleted += 1;
  } else {
    progress.daily.push({ date: today, scenariosCompleted: 1 });
    if (progress.daily.length > 30) {
      progress.daily = progress.daily.slice(-30);
    }
  }

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (progress.lastActiveDate === today) {
    // already active today — no change
  } else if (progress.lastActiveDate === yesterdayStr) {
    // consecutive day
    progress.streak += 1;
    progress.frozeStreak = false;
  } else if (progress.lastActiveDate) {
    // missed at least one day — check for freeze
    const freezes = progress.streakFreezes ?? 0;
    if (freezes > 0 && progress.streak > 0) {
      progress.streakFreezes = freezes - 1;
      progress.frozeStreak = true;
      // streak continues — don't increment (we're resuming after a gap)
    } else {
      progress.streak = 1;
      progress.frozeStreak = false;
    }
  } else {
    progress.streak = 1;
    progress.frozeStreak = false;
  }
  progress.lastActiveDate = today;

  // Award a freeze token at every 7-day streak milestone (max 3 held)
  const prevStreakBeforeUpdate = progress.streak - 1;
  if (
    progress.streak > 0 &&
    progress.streak % 7 === 0 &&
    prevStreakBeforeUpdate % 7 !== 0 &&
    (progress.streakFreezes ?? 0) < 3
  ) {
    progress.streakFreezes = (progress.streakFreezes ?? 0) + 1;
  }

  // Check badges
  const savedPhrasesCount = getSavedPhrases().length;
  const newBadges = checkNewBadges(progress, savedPhrasesCount);
  for (const bid of newBadges) {
    progress.earnedBadges.push(bid);
    progress.xp += BADGE_MAP[bid].xpReward;
  }

  saveProgress(progress);
  return { progress, newBadges };
}

export function awardXP(amount: number): Progress {
  const progress = getProgress();
  progress.xp += amount;
  saveProgress(progress);
  return progress;
}

export function recordNaturalReply(): { progress: Progress; newBadges: BadgeId[] } {
  const progress = getProgress();
  progress.naturalReplies = (progress.naturalReplies ?? 0) + 1;
  progress.xp += 25; // bonus XP for natural reply

  const savedPhrasesCount = getSavedPhrases().length;
  const newBadges = checkNewBadges(progress, savedPhrasesCount);
  for (const bid of newBadges) {
    progress.earnedBadges.push(bid);
    progress.xp += BADGE_MAP[bid].xpReward;
  }

  saveProgress(progress);
  return { progress, newBadges };
}

export function addRecentPrompt(prompt: string): void {
  const progress = getProgress();
  progress.recentPrompts = [
    prompt,
    ...progress.recentPrompts.filter((p) => p !== prompt),
  ].slice(0, 5);
  saveProgress(progress);
}

export function getStreakFreezes(): number {
  return getProgress().streakFreezes ?? 0;
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

  // Check collector badge after saving
  const progress = getProgress();
  const count = phrases.length;
  const newBadges = checkNewBadges(progress, count);
  if (newBadges.length > 0) {
    for (const bid of newBadges) {
      progress.earnedBadges.push(bid);
      progress.xp += BADGE_MAP[bid].xpReward;
    }
    saveProgress(progress);
  }
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

// --- Spaced Repetition (SM-2) ---

/**
 * Update a phrase's SRS schedule based on whether the user recalled it.
 * quality: 1 = recalled, 0 = forgot
 */
export function updateSRS(phraseId: string, quality: 0 | 1): void {
  const phrases = getSavedPhrases();
  const idx = phrases.findIndex((p) => p.id === phraseId);
  if (idx === -1) return;

  const phrase = phrases[idx];
  const srs = phrase.srs ?? { nextReview: getToday(), interval: 1, repetitions: 0, ease: 2.5 };

  if (quality === 0) {
    // Forgot: reset repetitions, review again tomorrow
    srs.repetitions = 0;
    srs.interval = 1;
  } else {
    // Recalled: advance schedule
    if (srs.repetitions === 0) {
      srs.interval = 1;
    } else if (srs.repetitions === 1) {
      srs.interval = 6;
    } else {
      srs.interval = Math.round(srs.interval * srs.ease);
    }
    srs.repetitions += 1;
    srs.ease = Math.max(1.3, srs.ease + 0.1 - (1 - quality) * (0.08 + (1 - quality) * 0.02));
  }

  const next = new Date();
  next.setDate(next.getDate() + srs.interval);
  srs.nextReview = next.toISOString().split('T')[0];

  phrases[idx] = { ...phrase, srs };
  localStorage.setItem(KEYS.SAVED_PHRASES, JSON.stringify(phrases));
}

export function getDueForReview(): SavedPhrase[] {
  const today = getToday();
  return getSavedPhrases().filter((p) => {
    if (!p.srs) return true; // never reviewed → always due
    return p.srs.nextReview <= today;
  });
}

// --- Custom Scenarios ---

export function getCustomScenarios(): CustomScenario[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_SCENARIOS);
    return raw ? (JSON.parse(raw) as CustomScenario[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomScenario(scenario: CustomScenario): void {
  const list = getCustomScenarios();
  list.unshift(scenario);
  localStorage.setItem(KEYS.CUSTOM_SCENARIOS, JSON.stringify(list));
}

export function deleteCustomScenario(id: string): void {
  const list = getCustomScenarios().filter((s) => s.id !== id);
  localStorage.setItem(KEYS.CUSTOM_SCENARIOS, JSON.stringify(list));
}

// --- Accent ---

export function getAccent(): AccentCode {
  if (typeof window === 'undefined') return 'en-US';
  return (localStorage.getItem(KEYS.ACCENT) as AccentCode) ?? 'en-US';
}

export function setAccent(code: AccentCode): void {
  localStorage.setItem(KEYS.ACCENT, code);
}
