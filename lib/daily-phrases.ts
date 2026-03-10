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
  {
    phrase: 'Hang in there',
    meaning: 'Stay strong / keep going through a tough time.',
    example: '"Finals week is brutal." — "Hang in there, you\'re almost done!"',
    culturalNote: 'Americans use encouraging phrases like this to show support without overstepping. It acknowledges difficulty while expressing confidence the person can handle it.',
    category: 'idiom',
    quiz: { question: '"Hang in there" is used to:', options: ['Tell someone to wait', 'Encourage someone going through a hard time', 'Ask someone to hold something', 'Say goodbye'], correctIndex: 1 },
  },
  {
    phrase: 'I feel you',
    meaning: 'I understand what you\'re going through / I relate to that.',
    example: '"Working from home gets lonely sometimes." — "I feel you."',
    culturalNote: 'This is more empathetic than "I understand." It signals emotional connection and shared experience. It\'s casual — you\'d use it with friends, not in a formal meeting.',
    category: 'slang',
    quiz: { question: '"I feel you" expresses:', options: ['Physical touch', 'Deep empathy and understanding', 'Disagreement', 'Confusion'], correctIndex: 1 },
  },
  {
    phrase: 'It\'s giving...',
    meaning: 'It reminds me of / it has the vibe of (used to describe an energy or aesthetic).',
    example: '"That outfit is giving main character energy."',
    culturalNote: 'Originally from Black and LGBTQ+ communities, this expression went mainstream through social media. It\'s used to describe the vibe or energy something projects. Understanding where slang originates helps you use it respectfully.',
    category: 'slang',
    quiz: { question: '"This coffee shop is giving cozy vibes" means:', options: ['The shop is giving away things', 'The shop has a cozy atmosphere', 'The shop is closing', 'The shop is new'], correctIndex: 1 },
  },
  {
    phrase: 'Touch base',
    meaning: 'To briefly check in or reconnect with someone.',
    example: '"Let\'s touch base next week about the project timeline."',
    culturalNote: 'A baseball metaphor used heavily in American workplaces. It means a quick, informal check-in — not a long meeting. Knowing the difference between "touch base" (quick) and "deep dive" (thorough) helps in office settings.',
    category: 'cultural',
    quiz: { question: '"Let\'s touch base tomorrow" means:', options: ['Let\'s play baseball', 'Let\'s have a quick check-in', 'Let\'s cancel the meeting', 'Let\'s shake hands'], correctIndex: 1 },
  },
  {
    phrase: 'Ghost someone',
    meaning: 'To suddenly stop responding to someone\'s messages without explanation.',
    example: '"We texted for weeks and then he just ghosted me."',
    culturalNote: 'Ghosting is considered rude in American culture but extremely common, especially in dating. Understanding this word helps you talk about modern social dynamics and shows awareness of current cultural norms.',
    category: 'slang',
    quiz: { question: 'If someone "ghosted" you, they:', options: ['Scared you', 'Stopped replying to your messages', 'Sent you a Halloween costume', 'Talked about you behind your back'], correctIndex: 1 },
  },
  {
    phrase: 'That\'s fair',
    meaning: 'I see your point / that\'s a reasonable take.',
    example: '"I don\'t think we should rush this." — "That\'s fair."',
    culturalNote: 'This is a graceful way to concede a point in a discussion without fully giving up your position. It acknowledges the other person\'s logic. Americans value appearing reasonable in disagreements.',
    category: 'filler',
    quiz: { question: '"That\'s fair" is used when you:', options: ['Strongly disagree', 'Think something costs the right price', 'Acknowledge someone made a valid point', 'Want to end the conversation'], correctIndex: 2 },
  },
  {
    phrase: 'Vibe check',
    meaning: 'Assessing the mood or energy of a person or situation.',
    example: '"Vibe check — is everyone feeling good about this plan?"',
    culturalNote: 'Originally Gen Z internet slang, "vibe check" has entered casual workplace and social language. It\'s a playful way to gauge how people are feeling. Using it shows you\'re tuned into current American English.',
    category: 'slang',
    quiz: { question: 'A "vibe check" is:', options: ['A medical test', 'Checking someone\'s mood or energy', 'A background check', 'A fact-check'], correctIndex: 1 },
  },
  {
    phrase: 'Give me a sec',
    meaning: 'Wait a moment, please.',
    example: '"Give me a sec, I need to find that email."',
    culturalNote: 'Americans shorten everything: "second" becomes "sec", "minute" becomes "min." These shortened forms feel natural and friendly. The formal equivalent — "one moment please" — is reserved for customer service or professional settings.',
    category: 'filler',
    quiz: { question: '"Give me a sec" is equivalent to:', options: ['Give me a secret', 'Wait a moment', 'Give me a second chance', 'Leave me alone'], correctIndex: 1 },
  },
  {
    phrase: 'Read the room',
    meaning: 'To sense the social atmosphere and adjust your behavior accordingly.',
    example: '"He started joking around during the serious meeting — he really didn\'t read the room."',
    culturalNote: 'Social awareness is highly valued in American culture. "Reading the room" means picking up on unspoken cues — body language, tone, energy level — and adapting. It\'s a crucial skill for fitting in socially.',
    category: 'idiom',
    quiz: { question: 'Someone who "can\'t read the room" is:', options: ['Illiterate', 'Unaware of the social situation', 'Looking for a book', 'Very intelligent'], correctIndex: 1 },
  },
  {
    phrase: 'Bet',
    meaning: 'Okay / sounds good / I agree (casual affirmation).',
    example: '"Pick you up at 7?" — "Bet."',
    culturalNote: 'Short for "you bet" or used as standalone agreement. Very casual and popular among younger Americans. Using it signals comfort with informal American English. In more formal settings, stick with "sounds good."',
    category: 'slang',
    quiz: { question: 'Someone responds "bet" to your plan. This means:', options: ['They want to gamble', 'They agree', 'They\'re unsure', 'They\'re being sarcastic'], correctIndex: 1 },
  },
  {
    phrase: 'On the same page',
    meaning: 'To have a shared understanding about something.',
    example: '"Before we start, let\'s make sure we\'re all on the same page."',
    culturalNote: 'Essential workplace phrase. Americans value alignment and hate surprises in professional settings. Getting "on the same page" is about preventing miscommunication — a core value in American work culture.',
    category: 'idiom',
    quiz: { question: '"Are we on the same page?" asks if you:', options: ['Are reading the same book', 'Share the same understanding', 'Are in the same location', 'Have the same schedule'], correctIndex: 1 },
  },
  {
    phrase: 'That slaps',
    meaning: 'That\'s really good / impressive (used for food, music, etc.).',
    example: '"Have you tried the new ramen place? It slaps."',
    culturalNote: 'Originally used about music ("this song slaps"), it now applies to anything great — especially food. It\'s enthusiastic and casual. Knowing which slang fits which context (food, music, experiences) helps you sound natural.',
    category: 'slang',
    quiz: { question: '"This pasta slaps" means:', options: ['The pasta hit someone', 'The pasta is incredibly good', 'The pasta is spicy', 'The pasta is loud'], correctIndex: 1 },
  },
  {
    phrase: 'At the end of the day',
    meaning: 'Ultimately / when everything is considered.',
    example: '"At the end of the day, we just want the project to succeed."',
    culturalNote: 'A common transitional phrase used to summarize or get to the core point. Americans use it to cut through complexity and state what really matters. Overusing it can sound repetitive — mix it with "ultimately" or "bottom line."',
    category: 'filler',
    quiz: { question: '"At the end of the day" means:', options: ['At nighttime', 'When everything is considered', 'After work hours', 'Tomorrow'], correctIndex: 1 },
  },
  {
    phrase: 'No cap',
    meaning: 'No lie / I\'m being completely serious.',
    example: '"That was the best pizza I\'ve ever had, no cap."',
    culturalNote: '"Cap" means lie in modern American slang, so "no cap" means "no lie." It\'s very casual and mostly used by younger Americans. In professional settings, you\'d say "seriously" or "honestly" instead.',
    category: 'slang',
    quiz: { question: '"No cap" means:', options: ['No hat', 'No limit', 'No lie / I\'m serious', 'No problem'], correctIndex: 2 },
  },
  {
    phrase: 'Drop the ball',
    meaning: 'To make a mistake or fail to follow through on a responsibility.',
    example: '"I dropped the ball on sending that report — I\'m sorry."',
    culturalNote: 'Another sports metaphor (from football/baseball). Americans use it to own up to mistakes in a way that feels direct but not overly dramatic. Taking accountability quickly is respected in American culture.',
    category: 'idiom',
    quiz: { question: '"I dropped the ball" means:', options: ['I literally dropped a ball', 'I failed to do something I was supposed to', 'I quit my job', 'I made a great play'], correctIndex: 1 },
  },
  {
    phrase: 'Spill the tea',
    meaning: 'Share the gossip / tell me the juicy details.',
    example: '"You went on a date last night? Spill the tea!"',
    culturalNote: 'Originated in drag culture and popularized through social media. "Tea" means gossip or truth. Americans love indirect ways of asking for gossip — it makes the conversation feel playful rather than nosy.',
    category: 'slang',
    quiz: { question: '"Spill the tea" means:', options: ['Pour a drink', 'Make a mess', 'Share gossip or details', 'Tell a lie'], correctIndex: 2 },
  },
  {
    phrase: 'Super',
    meaning: 'Very / really (used as an intensifier).',
    example: '"I\'m super excited about the concert this weekend!"',
    culturalNote: 'Americans use "super" as a casual intensifier constantly: super tired, super busy, super helpful. It sits between "pretty" (mild) and "incredibly" (strong). Using "super" naturally in conversation is a mark of fluent casual English.',
    category: 'filler',
    quiz: { question: '"I\'m super into this show" means:', options: ['I\'m physically inside the show', 'I really like this show', 'I\'m a superhero', 'I watch too much TV'], correctIndex: 1 },
  },
  {
    phrase: 'Call it a day',
    meaning: 'To stop working or doing something for now.',
    example: '"We\'ve been at this for hours — let\'s call it a day."',
    culturalNote: 'This signals you\'ve done enough and it\'s time to stop. It\'s commonly used at work but also applies to any activity. Americans value work-life balance language — knowing phrases like this helps set boundaries naturally.',
    category: 'idiom',
    quiz: { question: '"Let\'s call it a day" means:', options: ['Let\'s name today', 'Let\'s stop and rest', 'Let\'s make a phone call', 'Let\'s start working harder'], correctIndex: 1 },
  },
  {
    phrase: 'Big picture',
    meaning: 'The overall situation or perspective, not the small details.',
    example: '"Don\'t get lost in the details — think about the big picture."',
    culturalNote: 'Americans frequently contrast "big picture" thinking with getting "in the weeds" (too focused on details). In meetings, asking "what\'s the big picture here?" shows strategic thinking and is valued in workplace culture.',
    category: 'cultural',
    quiz: { question: '"Let\'s focus on the big picture" means:', options: ['Let\'s take a photo', 'Let\'s look at the overall strategy', 'Let\'s watch a movie', 'Let\'s zoom in on details'], correctIndex: 1 },
  },
  {
    phrase: 'Wild',
    meaning: 'Crazy / unbelievable / extreme.',
    example: '"She quit her job and moved to Japan." — "That\'s wild."',
    culturalNote: '"Wild" has replaced "crazy" in many casual contexts because it feels less judgmental. When Americans say something is "wild," they usually mean it\'s surprising or impressive — not necessarily bad. Tone matters with this word.',
    category: 'slang',
    quiz: { question: '"That story is wild" means:', options: ['The story is about nature', 'The story is unbelievable or extreme', 'The story is poorly written', 'The story is boring'], correctIndex: 1 },
  },
];

/** Deterministic shuffle seeded by year so order feels fresh each year. */
function seededShuffle(arr: DailyPhrase[], seed: number): DailyPhrase[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647; // Park-Miller LCG
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Get the phrase of the day based on the current date with yearly shuffle. */
export function getPhraseOfTheDay(): DailyPhrase {
  const today = new Date();
  const year = today.getFullYear();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(year, 0, 0).getTime()) / 86400000,
  );
  const shuffled = seededShuffle(dailyPhrases, year);
  return shuffled[dayOfYear % shuffled.length];
}

/** Get an archive of recent phrases (last 7 days). */
export function getRecentPhrases(): { date: string; phrase: DailyPhrase }[] {
  const result: { date: string; phrase: DailyPhrase }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const dayOfYear = Math.floor(
      (d.getTime() - new Date(year, 0, 0).getTime()) / 86400000,
    );
    const shuffled = seededShuffle(dailyPhrases, year);
    result.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      phrase: shuffled[dayOfYear % shuffled.length],
    });
  }
  return result;
}
