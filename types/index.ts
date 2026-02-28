export type Tone = 'Casual' | 'Funny' | 'Warm' | 'Safe';

export type Context = 'Any' | 'Work' | 'Text' | 'Party' | 'Family';

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

export interface Progress {
  completedScenarios: string[]; // scenario IDs
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  daily: DailyProgress[]; // last 30 days
  recentPrompts: string[];
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
