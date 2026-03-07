import type { DailyPhrase } from '@/types';

export const dailyPhrases: DailyPhrase[] = [
  {
    phrase: 'Break the ice',
    meaning: 'To start a conversation in an awkward or tense social situation.',
    example: '"I told a joke to break the ice at the networking event."',
    culturalNote: 'Americans value being approachable. Starting with humor or a compliment is a common way to break the ice — it shows warmth without being too personal.',
    category: 'idiom',
    quiz: { question: 'When would you "break the ice"?', options: ['When you arrive late', 'When meeting someone new', 'When leaving a party', 'When disagreeing'], correctIndex: 1 },
  },
  {
    phrase: 'No worries',
    meaning: 'It\'s okay / don\'t worry about it. A casual way to accept an apology or say something is fine.',
    example: '"Sorry I\'m late!" — "No worries, we just got here too."',
    culturalNote: 'This has become the default American response to minor apologies. It\'s warmer than "it\'s fine" and signals you\'re genuinely not bothered. Using "no problem" is equally common.',
    category: 'slang',
    quiz: { question: 'Someone bumps into you and says sorry. What\'s the most natural response?', options: ['I forgive you', 'No worries!', 'That is acceptable', 'Please be careful'], correctIndex: 1 },
  },
  {
    phrase: 'You know what I mean?',
    meaning: 'A filler phrase used to check if the listener understands or relates.',
    example: '"It\'s one of those days where nothing goes right, you know what I mean?"',
    culturalNote: 'American English is full of "filler phrases" that don\'t add meaning but build connection. "You know what I mean?", "right?", and "like" are social glue — they invite the listener to engage.',
    category: 'filler',
    quiz: { question: 'What purpose does "you know what I mean?" serve?', options: ['Asking a real question', 'Showing anger', 'Building connection with the listener', 'Ending a conversation'], correctIndex: 2 },
  },
  {
    phrase: 'Rain check',
    meaning: 'To postpone an invitation to another time.',
    example: '"I can\'t make it tonight — can I take a rain check?"',
    culturalNote: 'This comes from baseball — if a game was rained out, you\'d get a ticket (rain check) for a future game. Americans use it to decline politely while showing they\'re genuinely interested in rescheduling.',
    category: 'idiom',
    quiz: { question: 'What does "Can I take a rain check?" mean?', options: ['I want to check the weather', 'I\'d like to do this another time', 'I need to think about it', 'I\'m saying no forever'], correctIndex: 1 },
  },
  {
    phrase: 'My bad',
    meaning: 'A casual way to acknowledge a small mistake.',
    example: '"Oh, I grabbed your coffee by mistake — my bad!"',
    culturalNote: 'Americans tend to downplay minor mistakes with casual language. "My bad" is lighter than "I\'m sorry" and signals the mistake was small. For bigger mistakes, a sincere "I\'m really sorry" is expected.',
    category: 'slang',
    quiz: { question: 'When is "my bad" most appropriate?', options: ['After a serious mistake at work', 'After a small, harmless mix-up', 'When you want to be very formal', 'When apologizing to your boss'], correctIndex: 1 },
  },
  {
    phrase: 'I mean...',
    meaning: 'A filler used to clarify, emphasize, or soften what you\'re about to say.',
    example: '"I mean, it\'s not the worst idea, but maybe we should think about it more."',
    culturalNote: 'Starting sentences with "I mean" is extremely common in American English. It softens opinions and makes disagreements feel less confrontational. It\'s a key tool for sounding natural in conversation.',
    category: 'filler',
    quiz: { question: 'What does starting with "I mean..." usually signal?', options: ['You\'re angry', 'You\'re about to clarify or soften a point', 'You forgot what to say', 'You\'re changing the subject'], correctIndex: 1 },
  },
  {
    phrase: 'How\'s it going?',
    meaning: 'A casual greeting — not a real question about your life.',
    example: '"Hey! How\'s it going?" — "Good, you?"',
    culturalNote: 'One of the biggest cultural adjustments: Americans ask "How are you?" or "How\'s it going?" as a greeting, not a genuine question. The expected response is short and positive ("Good!", "Not bad!"), not a detailed life update.',
    category: 'cultural',
    quiz: { question: 'Someone says "How\'s it going?" in passing. Best response?', options: ['Let me tell you about my week...', 'Good, you?', 'I\'m having some health issues actually', 'Why do you ask?'], correctIndex: 1 },
  },
  {
    phrase: 'Sounds good',
    meaning: 'A versatile agreement phrase meaning "yes" or "I\'m on board."',
    example: '"Let\'s meet at noon?" — "Sounds good!"',
    culturalNote: '"Sounds good" is the Swiss Army knife of American English. It works for confirming plans, agreeing with ideas, or acknowledging information. It\'s more enthusiastic than "okay" but less intense than "absolutely!"',
    category: 'slang',
    quiz: { question: 'Which situation fits "sounds good"?', options: ['Receiving bad news', 'Agreeing to a lunch plan', 'Expressing deep gratitude', 'Apologizing for something'], correctIndex: 1 },
  },
  {
    phrase: 'Hit me up',
    meaning: 'Contact me / reach out to me (casual).',
    example: '"If you\'re ever in town, hit me up!"',
    culturalNote: 'This is informal and typically used among friends or peers. Using it with your boss would sound too casual. Knowing when to switch between casual ("hit me up") and formal ("feel free to reach out") is key to American social fluency.',
    category: 'slang',
    quiz: { question: 'Who would you say "hit me up" to?', options: ['Your CEO', 'A friend you\'re making plans with', 'A judge', 'A customer service agent'], correctIndex: 1 },
  },
  {
    phrase: 'Honestly',
    meaning: 'A filler that adds emphasis or signals you\'re being candid.',
    example: '"Honestly, I\'m just glad it\'s Friday."',
    culturalNote: 'Americans frequently start sentences with "honestly" or "to be honest" — it doesn\'t mean they\'re usually dishonest! It just adds emphasis. Similar to "literally" being used for exaggeration rather than literal truth.',
    category: 'filler',
    quiz: { question: 'When someone says "honestly, it was fine," they mean:', options: ['They\'re lying', 'They want to emphasize it was genuinely fine', 'They\'re being sarcastic', 'They\'re upset'], correctIndex: 1 },
  },
  {
    phrase: 'I\'m down',
    meaning: 'I\'m interested / I\'ll do it (casual agreement).',
    example: '"Wanna grab tacos after work?" — "I\'m down!"',
    culturalNote: 'This is enthusiastic casual agreement. "I\'m down" feels more energetic than just "sure" or "okay." The opposite — "I\'m not really feeling it" — is a gentle way to decline without directly saying no.',
    category: 'slang',
    quiz: { question: 'Your friend suggests going bowling. "I\'m down" means:', options: ['You feel sad', 'You enthusiastically agree', 'You need to think about it', 'You\'re tired'], correctIndex: 1 },
  },
  {
    phrase: 'For sure',
    meaning: 'Definitely / absolutely (casual agreement).',
    example: '"Can you send me that file?" — "For sure, I\'ll send it right now."',
    culturalNote: 'The spectrum of American agreement goes: "I guess" (reluctant) → "Sure" (neutral) → "For sure" (confident) → "Absolutely" (enthusiastic). Choosing the right level signals how you actually feel about something.',
    category: 'slang',
    quiz: { question: 'Rank these from least to most enthusiastic: sure, for sure, I guess, absolutely', options: ['sure, I guess, for sure, absolutely', 'I guess, sure, for sure, absolutely', 'absolutely, for sure, sure, I guess', 'I guess, for sure, sure, absolutely'], correctIndex: 1 },
  },
  {
    phrase: 'That tracks',
    meaning: 'That makes sense / that\'s consistent with what I know.',
    example: '"She said the meeting got moved to Friday." — "Yeah, that tracks."',
    culturalNote: 'A newer expression that\'s become very popular. It originally comes from data/science contexts ("the data tracks") but is now used casually to mean "that makes sense." Using current expressions like this helps you sound natural.',
    category: 'slang',
    quiz: { question: '"That tracks" is closest in meaning to:', options: ['That\'s incorrect', 'That makes sense', 'That\'s surprising', 'I don\'t care'], correctIndex: 1 },
  },
  {
    phrase: 'Let\'s circle back',
    meaning: 'Let\'s return to this topic later.',
    example: '"Good points — let\'s circle back on this after lunch."',
    culturalNote: 'This is corporate American English. In workplace settings, Americans use many metaphors from sports and business. "Circle back", "touch base", "loop in", "move the needle" — knowing these helps you navigate office culture.',
    category: 'cultural',
    quiz: { question: '"Let\'s circle back" is most commonly used in:', options: ['A birthday party', 'A work meeting', 'A doctor\'s office', 'A restaurant'], correctIndex: 1 },
  },
  {
    phrase: 'It is what it is',
    meaning: 'Accepting a situation you can\'t change.',
    example: '"The flight got delayed three hours." — "Well, it is what it is."',
    culturalNote: 'This phrase reflects a common American attitude of pragmatic acceptance. Rather than complaining at length, Americans often acknowledge something is bad and move on. It\'s philosophical resignation in six words.',
    category: 'cultural',
    quiz: { question: '"It is what it is" expresses:', options: ['Excitement', 'Confusion', 'Acceptance of something you can\'t change', 'A request for help'], correctIndex: 2 },
  },
  {
    phrase: 'Lowkey',
    meaning: 'Somewhat / secretly / in a subtle way.',
    example: '"I\'m lowkey excited about the office holiday party."',
    culturalNote: 'Originally internet slang, "lowkey" is now mainstream casual American English, especially among younger speakers. Its opposite is "highkey" (openly/very). These modifiers help you express degrees of feeling naturally.',
    category: 'slang',
    quiz: { question: '"I lowkey want to leave early" means:', options: ['I definitely want to leave early', 'I kind of want to leave early but don\'t want to make a big deal of it', 'I don\'t want to leave', 'I\'m asking permission to leave'], correctIndex: 1 },
  },
  {
    phrase: 'Same here',
    meaning: 'I feel the same way / me too.',
    example: '"I could really use a vacation." — "Same here."',
    culturalNote: 'Americans love quick agreement phrases. "Same here", "same", "right?!", and "tell me about it" all express solidarity. They\'re how Americans bond — by showing shared experiences rather than giving advice.',
    category: 'filler',
    quiz: { question: 'Your coworker says "I\'m so tired today." The most natural response is:', options: ['You should sleep more', 'Same here', 'That\'s unfortunate', 'I don\'t care'], correctIndex: 1 },
  },
  {
    phrase: 'I\'ll keep you posted',
    meaning: 'I\'ll update you when I know more.',
    example: '"We\'re still waiting on the budget. I\'ll keep you posted."',
    culturalNote: 'This phrase is a workplace essential. It\'s professional yet friendly, and it sets expectations that you\'ll follow up without committing to a specific timeline. The informal version is "I\'ll let you know."',
    category: 'cultural',
    quiz: { question: '"I\'ll keep you posted" means:', options: ['I\'ll mail you a letter', 'I\'ll update you when there\'s news', 'I\'ll post about you on social media', 'I don\'t want to talk about it'], correctIndex: 1 },
  },
  {
    phrase: 'Good call',
    meaning: 'Good decision / smart choice.',
    example: '"I brought an umbrella just in case." — "Good call, it\'s supposed to rain."',
    culturalNote: 'This comes from sports (a referee making a "good call"). Americans frequently use sports language in everyday life: "game plan", "home run", "dropped the ball", "in the zone." It\'s woven into the culture.',
    category: 'idiom',
    quiz: { question: '"Good call on bringing extra water" means:', options: ['Make a phone call', 'That was a smart decision', 'Please call someone', 'You made a mistake'], correctIndex: 1 },
  },
  {
    phrase: 'That\'s a lot',
    meaning: 'That\'s intense / overwhelming / hard to deal with.',
    example: '"My car broke down, then I got a parking ticket." — "Wow, that\'s a lot."',
    culturalNote: 'When Americans say "that\'s a lot" about someone\'s situation, it\'s empathetic shorthand for "I acknowledge that\'s difficult." It validates without offering unsolicited advice — which Americans generally prefer over being told what to do.',
    category: 'cultural',
    quiz: { question: 'Responding with "that\'s a lot" shows:', options: ['You\'re bored', 'Empathy and validation', 'You want them to stop talking', 'You think they\'re exaggerating'], correctIndex: 1 },
  },
];

/** Get the phrase of the day based on the current date. */
export function getPhraseOfTheDay(): DailyPhrase {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return dailyPhrases[dayOfYear % dailyPhrases.length];
}

/** Get an archive of recent phrases (last 7 days). */
export function getRecentPhrases(): { date: string; phrase: DailyPhrase }[] {
  const result: { date: string; phrase: DailyPhrase }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfYear = Math.floor(
      (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    result.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      phrase: dailyPhrases[dayOfYear % dailyPhrases.length],
    });
  }
  return result;
}
