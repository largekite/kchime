export type Tone = 'Casual' | 'Funny' | 'Warm' | 'Safe';

export type Context = 'Any' | 'Office' | 'Text' | 'Party' | 'Family';

export interface Reply {
  id: string;
  tone: Tone;
  text: string;
}

export interface SavedPhrase {
  id: string;
  text: string;
  tone: Tone;
  context: Context;
  prompt: string;
  savedAt: string; // ISO date string
  srs?: {
    nextReview: string; // ISO date YYYY-MM-DD
    interval: number;   // days until next review
    repetitions: number;
    ease: number;       // SM-2 ease factor, starts at 2.5
  };
}

export interface CustomScenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  openingLine: string;
  context: string;
  suggestedReplies: string[];
  createdAt: string;
  isCustom: true;
}

export interface Scenario {
  id: string;
  title: string;
  category: ScenarioCategory;
  openingLine: string;
  context: string;
  suggestedReplies: string[];
}

export type ScenarioCategory =
  | 'Small Talk'
  | 'Weekend Plans'
  | 'Workplace Banter'
  | 'Sports Talk'
  | 'American Humor'
  | 'Holiday Greetings'
  | 'Food & Dining'
  | 'Social Events'
  | 'Compliments';

export interface EvaluationResult {
  natural: boolean;
  feedback: string;
  suggestion?: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  scenariosCompleted: number;
}

export type BadgeId =
  | 'first_step'
  | 'quick_learner'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'collector'
  | 'explorer'
  | 'halfway'
  | 'master'
  | 'natural';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  xpReward: number;
  emoji: string;
}

export interface Progress {
  completedScenarios: string[]; // scenario IDs
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  daily: DailyProgress[]; // last 30 days
  recentPrompts: string[];
  xp: number;
  earnedBadges: BadgeId[];
  naturalReplies: number; // count of natural feedback ratings
  streakFreezes: number; // available streak freeze tokens
  frozeStreak?: boolean; // true if the current streak was saved by a freeze today
}

export interface ConversationRound {
  id: string;
  transcript: string;
  replies: Reply[];
  phraseExplanations?: PhraseExplanation[];
}

export interface PhraseExplanation {
  phrase: string;
  meaning: string;
  tip?: string;
}

export type AccentCode = 'en-US' | 'en-GB' | 'en-AU' | 'en-IN';

export interface Accent {
  code: AccentCode;
  label: string;
  flag: string;
}

export type WorkplacePreset =
  | 'Reply to Manager'
  | 'Reply to Direct Report'
  | 'Reply to Client'
  | 'Push Back Politely'
  | 'Deliver Constructive Feedback'
  | 'Escalate Issue Professionally';

export interface WorkReplyVariation {
  id: string;
  strategy: string;
  label: string;
  text: string;
  risk: 'Low' | 'Medium' | 'High';
  powerPosition: string;
  assertiveness: number;
  warmth: number;
}

export interface WorkReplyResult {
  variations: WorkReplyVariation[];
  bestChoiceIndex: number;
}
