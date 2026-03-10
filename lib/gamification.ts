import type { Badge, BadgeId, Progress } from '@/types';
import { getScenariosByCategory, allCategories } from '@/lib/scenarios';

export const BADGES: Badge[] = [
  { id: 'first_step',    name: 'First Step',            description: 'Complete your first scenario',                xpReward: 50,   emoji: '👣' },
  { id: 'quick_learner', name: 'Quick Learner',          description: 'Complete 5 scenarios in one day',             xpReward: 100,  emoji: '⚡' },
  { id: 'streak_3',      name: 'On a Roll',              description: 'Keep a 3-day practice streak',                xpReward: 75,   emoji: '🔥' },
  { id: 'streak_7',      name: 'Week Warrior',           description: 'Keep a 7-day practice streak',                xpReward: 200,  emoji: '📆' },
  { id: 'streak_30',     name: 'Iron Will',              description: 'Keep a 30-day practice streak',               xpReward: 1000, emoji: '💪' },
  { id: 'collector',     name: 'Collector',              description: 'Save 10 phrases to your library',             xpReward: 100,  emoji: '📖' },
  { id: 'explorer',      name: 'Explorer',               description: 'Complete at least one scenario per category', xpReward: 250,  emoji: '🧭' },
  { id: 'halfway',       name: 'Halfway There',          description: 'Complete 25 scenarios',                       xpReward: 200,  emoji: '⭐' },
  { id: 'master',        name: 'Conversation Master',    description: 'Complete all 47 scenarios',                   xpReward: 1000, emoji: '🏆' },
  { id: 'natural',       name: 'Natural Speaker',        description: 'Receive 10 "natural" feedback ratings',       xpReward: 150,  emoji: '🎤' },
  { id: 'ten_down',      name: 'Getting Warmed Up',      description: 'Complete 10 scenarios',                        xpReward: 100,  emoji: '🔟' },
  { id: 'fifteen_strong', name: 'Fifteen Strong',         description: 'Complete 15 scenarios',                        xpReward: 150,  emoji: '💫' },
  { id: 'twenty_club',   name: 'Twenty Club',            description: 'Complete 20 scenarios',                        xpReward: 175,  emoji: '🎯' },
  { id: 'quiz_streak_7', name: 'Quiz Whiz',              description: 'Answer the daily phrase quiz 7 days in a row', xpReward: 150,  emoji: '🧠' },
  { id: 'pack_explorer',     name: 'Pack Explorer',    description: 'Open 10 different pack scenarios',              xpReward: 100,  emoji: '📦' },
  { id: 'pack_completionist', name: 'Pack Pro',        description: 'Open every scenario across all packs',          xpReward: 300,  emoji: '👑' },
  { id: 'culture_buff',      name: 'Culture Buff',     description: 'Read 20 cultural notes',                        xpReward: 125,  emoji: '🌎' },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b])) as Record<BadgeId, Badge>;

// XP thresholds for each level (index = level - 1)
const LEVEL_THRESHOLDS = [0, 150, 400, 800, 1400, 2200, 3200, 4500, 6200, 8500];

export const LEVEL_NAMES = [
  'Beginner', 'Learner', 'Conversant', 'Fluent', 'Confident',
  'Advanced', 'Articulate', 'Expert', 'Master', 'Legend',
];

export function getLevel(xp: number): { level: number; name: string; current: number; next: number | null; pct: number } {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
  }
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : null;
  const pct = next ? Math.round(((xp - current) / (next - current)) * 100) : 100;
  return { level, name: LEVEL_NAMES[level - 1], current, next, pct };
}

/** Check which new badges should be earned given current progress. Returns new badge IDs. */
export function checkNewBadges(progress: Progress, savedPhrasesCount: number, totalPackScenarios?: number): BadgeId[] {
  const earned = new Set(progress.earnedBadges);
  const newBadges: BadgeId[] = [];

  function check(id: BadgeId, condition: boolean) {
    if (!earned.has(id) && condition) newBadges.push(id);
  }

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = progress.daily.find((d) => d.date === today);
  const todayCount = todayEntry?.scenariosCompleted ?? 0;

  // Check if at least one scenario per category is completed
  const explorerDone = allCategories.every((cat) => {
    const catScenarios = getScenariosByCategory(cat);
    return catScenarios.some((s) => progress.completedScenarios.includes(s.id));
  });

  check('first_step', progress.completedScenarios.length >= 1);
  check('quick_learner', todayCount >= 5);
  check('streak_3', progress.streak >= 3);
  check('streak_7', progress.streak >= 7);
  check('streak_30', progress.streak >= 30);
  check('collector', savedPhrasesCount >= 10);
  check('explorer', explorerDone);
  check('ten_down', progress.completedScenarios.length >= 10);
  check('fifteen_strong', progress.completedScenarios.length >= 15);
  check('twenty_club', progress.completedScenarios.length >= 20);
  check('halfway', progress.completedScenarios.length >= 25);
  check('master', progress.completedScenarios.length >= 47);
  check('natural', progress.naturalReplies >= 10);

  // Quiz streak badge: 7 consecutive days of quiz completion
  const quizDates = progress.quizCompletedDates ?? [];
  if (quizDates.length >= 7) {
    const sorted = [...quizDates].sort().reverse();
    let consecutive = 1;
    for (let i = 1; i < sorted.length && consecutive < 7; i++) {
      const prev = new Date(sorted[i - 1] + 'T12:00:00');
      const curr = new Date(sorted[i] + 'T12:00:00');
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (Math.round(diff) === 1) consecutive++;
      else break;
    }
    check('quiz_streak_7', consecutive >= 7);
  }

  // Pack badges
  const viewedPacks = progress.viewedPackScenarios ?? [];
  check('pack_explorer', viewedPacks.length >= 10);
  if (totalPackScenarios !== undefined && totalPackScenarios > 0) {
    check('pack_completionist', viewedPacks.length >= totalPackScenarios);
  }

  // Cultural note badge
  check('culture_buff', (progress.culturalNotesRead ?? 0) >= 20);

  return newBadges;
}

/** Calculate the current XP multiplier based on consecutive daily goals met. */
export function getDailyMultiplier(consecutiveDailyGoals: number): { multiplier: number; label: string } {
  // Day 1 = 1x, Day 2 = 1.5x, Day 3+ = 2x, Day 7+ = 3x (max)
  if (consecutiveDailyGoals >= 7) return { multiplier: 3.0, label: '3x' };
  if (consecutiveDailyGoals >= 3) return { multiplier: 2.0, label: '2x' };
  if (consecutiveDailyGoals >= 2) return { multiplier: 1.5, label: '1.5x' };
  return { multiplier: 1.0, label: '1x' };
}
