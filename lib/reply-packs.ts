import type { ReplyPack } from '@/types';

export const REPLY_PACKS: ReplyPack[] = [
  {
    id: 'awkward-fixes',
    title: 'Awkward Message Fixes',
    description: 'Smooth replies for those cringe-worthy moments we all dread.',
    emoji: '😬',
    color: 'teal',
    examples: [
      {
        id: 'awk-1',
        prompt: 'Sorry I just saw this',
        suggestedReplies: [
          'No worries at all! What\'s up?',
          'Haha all good, I do the same thing. What did you need?',
          'No stress! I figured you were busy.',
        ],
      },
      {
        id: 'awk-2',
        prompt: 'Just checking in',
        suggestedReplies: [
          'Hey! Thanks for checking in — everything\'s good on my end.',
          'Appreciate it! I was actually going to reach out to you.',
          'All good here! How about you?',
        ],
      },
      {
        id: 'awk-3',
        prompt: 'Following up',
        suggestedReplies: [
          'Thanks for the nudge! I\'ll have it to you by end of day.',
          'Appreciate the follow-up — here\'s where things stand.',
          'Got it, sorry for the delay. Let me get back to you shortly.',
        ],
      },
      {
        id: 'awk-4',
        prompt: 'My bad, I forgot',
        suggestedReplies: [
          'No worries, it happens! Just send it whenever you can.',
          'All good! I forget stuff all the time too.',
          'Don\'t sweat it — whenever you get a chance is fine.',
        ],
      },
      {
        id: 'awk-5',
        prompt: 'I didn\'t mean it like that',
        suggestedReplies: [
          'No worries, I figured it came out wrong. We\'re good!',
          'Haha I know what you meant! Don\'t worry about it.',
          'All good — tone is hard over text!',
        ],
      },
      {
        id: 'awk-6',
        prompt: 'Oops wrong person',
        suggestedReplies: [
          'Ha! No worries, happens to the best of us.',
          'Lol I was so confused for a sec 😂',
          'Classic wrong-chat moment! All good.',
        ],
      },
      {
        id: 'awk-7',
        prompt: 'Are you mad at me?',
        suggestedReplies: [
          'Not at all! Sorry if my texts came off that way.',
          'No way! I\'ve just been super busy. We\'re totally fine.',
          'Nope! Just been in my own world lately. What\'s up?',
        ],
      },
      {
        id: 'awk-8',
        prompt: 'Why didn\'t you reply?',
        suggestedReplies: [
          'Sorry, my notifications have been a mess! What\'s up?',
          'Ugh, I saw it and forgot to respond. My bad!',
          'I was meaning to but got sidetracked. I\'m here now!',
        ],
      },
      {
        id: 'awk-9',
        prompt: 'Did you get my last message?',
        suggestedReplies: [
          'Yes! Sorry, been meaning to get back to you. Here\'s the deal...',
          'I did! Just haven\'t had a chance to respond yet.',
          'Yep, got it! Let me circle back in a bit.',
        ],
      },
      {
        id: 'awk-10',
        prompt: 'We need to talk',
        suggestedReplies: [
          'Sure, what\'s on your mind? I\'m free now.',
          'Of course — is everything okay?',
          'Okay, I\'m all ears. When works for you?',
        ],
      },
      {
        id: 'awk-11',
        prompt: 'That was awkward lol',
        suggestedReplies: [
          'Haha yeah, let\'s just pretend that didn\'t happen 😂',
          'LOL I\'m glad I\'m not the only one who noticed!',
          'So awkward 😅 But honestly it\'s fine!',
        ],
      },
      {
        id: 'awk-12',
        prompt: 'I think there was a misunderstanding',
        suggestedReplies: [
          'Totally — let\'s clear it up! What did you mean?',
          'Yeah I think so too. No hard feelings on my end.',
          'Agreed! Let\'s start fresh. Here\'s what I was trying to say...',
        ],
      },
      {
        id: 'awk-13',
        prompt: 'Sorry for the late reply',
        suggestedReplies: [
          'No worries at all — better late than never!',
          'All good! I\'m just glad you got back to me.',
          'Don\'t even worry about it. What\'s going on?',
        ],
      },
      {
        id: 'awk-14',
        prompt: 'I hope I\'m not bothering you',
        suggestedReplies: [
          'Not at all! What do you need?',
          'You\'re totally fine! I\'m happy to help.',
          'Never a bother! What\'s up?',
        ],
      },
      {
        id: 'awk-15',
        prompt: 'Can I be honest with you?',
        suggestedReplies: [
          'Of course! I appreciate honesty.',
          'Always. Go ahead, I\'m listening.',
          'Sure thing — I\'d rather hear the truth.',
        ],
      },
      {
        id: 'awk-16',
        prompt: 'I don\'t know how to say this',
        suggestedReplies: [
          'Take your time — I\'m here whenever you\'re ready.',
          'No pressure. Just say it however feels right.',
          'I appreciate you wanting to talk. Go ahead.',
        ],
      },
      {
        id: 'awk-17',
        prompt: 'That came out wrong',
        suggestedReplies: [
          'No worries, I get what you meant!',
          'Ha, we\'ve all been there. What were you trying to say?',
          'Don\'t even trip — I know you didn\'t mean it that way.',
        ],
      },
      {
        id: 'awk-18',
        prompt: 'Sorry I cancelled last minute',
        suggestedReplies: [
          'No worries! These things happen. Let\'s reschedule.',
          'All good — life gets crazy sometimes!',
          'Don\'t stress about it! When are you free next?',
        ],
      },
      {
        id: 'awk-19',
        prompt: 'I forgot your name',
        suggestedReplies: [
          'Haha no worries! I\'m terrible with names too. It\'s [name].',
          'Don\'t feel bad — happens to everyone! I\'m [name].',
          'All good! Names are hard. I\'m [name], nice to re-meet you!',
        ],
      },
      {
        id: 'awk-20',
        prompt: 'I accidentally liked your old photo',
        suggestedReplies: [
          'Haha I\'ve done the same thing! No judgment here.',
          'LOL the deep scroll! We\'ve all been there 😂',
          'Ha! Don\'t worry about it — I do that all the time.',
        ],
      },
    ],
  },
  {
    id: 'reply-to-boss',
    title: 'Reply to Boss',
    description: 'Professional yet natural replies for your manager\'s messages.',
    emoji: '💼',
    color: 'indigo',
    examples: [
      {
        id: 'boss-1',
        prompt: 'Can you send the report tonight?',
        suggestedReplies: [
          'Absolutely, I\'ll have it in your inbox by end of day.',
          'Sure thing! I\'m wrapping it up now — should be ready within the hour.',
          'I\'m on it. Any specific format you prefer?',
        ],
      },
      {
        id: 'boss-2',
        prompt: 'Can we jump on a call?',
        suggestedReplies: [
          'Of course! I\'m free now, or I can do anytime this afternoon.',
          'Sure! Want me to send a calendar invite? What time works?',
          'Absolutely — I\'ll call you in 5. Does that work?',
        ],
      },
      {
        id: 'boss-3',
        prompt: 'Please fix this',
        suggestedReplies: [
          'On it! I\'ll take another look and get it corrected ASAP.',
          'Got it — I see the issue. I\'ll have the updated version shortly.',
          'Will do! Thanks for catching that. I\'ll send the fix today.',
        ],
      },
      {
        id: 'boss-4',
        prompt: 'Did you complete the task?',
        suggestedReplies: [
          'Yes, all done! I sent it over earlier today.',
          'Almost there — I\'m about 90% finished. Will wrap up within the hour.',
          'I did! Let me know if you need any changes.',
        ],
      },
      {
        id: 'boss-5',
        prompt: 'We need to discuss your performance',
        suggestedReplies: [
          'Of course, I\'d appreciate the feedback. When works best for you?',
          'I\'m open to that conversation. Should I block some time on your calendar?',
          'Sounds good — I\'d love to hear your thoughts. I\'m free this afternoon.',
        ],
      },
      {
        id: 'boss-6',
        prompt: 'Can you take on this extra project?',
        suggestedReplies: [
          'I\'d be happy to! Can you give me a quick overview of the timeline?',
          'Sure, I can make it work. Should I reprioritize anything else?',
          'Absolutely — I\'m interested. Let me know the details and deadline.',
        ],
      },
      {
        id: 'boss-7',
        prompt: 'Why wasn\'t this done on time?',
        suggestedReplies: [
          'You\'re right, and I apologize. I ran into [issue] — here\'s my plan to get it done today.',
          'I take responsibility for the delay. I\'ll have it completed by [time].',
          'Sorry about that. I underestimated the scope. It\'s my top priority now.',
        ],
      },
      {
        id: 'boss-8',
        prompt: 'Great job on the presentation',
        suggestedReplies: [
          'Thank you so much! I really appreciate the feedback.',
          'That means a lot — thanks for the opportunity to present!',
          'Thanks! The team really helped pull it together.',
        ],
      },
      {
        id: 'boss-9',
        prompt: 'I need this by tomorrow morning',
        suggestedReplies: [
          'Understood! I\'ll prioritize it and have it ready first thing.',
          'Got it — I\'ll stay on top of it tonight and deliver by morning.',
          'Consider it done! I\'ll send it over before 9 AM.',
        ],
      },
      {
        id: 'boss-10',
        prompt: 'Can you cover for Sarah while she\'s out?',
        suggestedReplies: [
          'Of course! Can she brief me on her current priorities?',
          'Happy to help. I\'ll check in with her before she leaves.',
          'Sure thing. How long will she be out?',
        ],
      },
      {
        id: 'boss-11',
        prompt: 'Let\'s set up a weekly check-in',
        suggestedReplies: [
          'Great idea! What day and time work best for you?',
          'I\'d love that — I\'ll send over some time options.',
          'Sounds good! I\'ll block out a recurring slot.',
        ],
      },
      {
        id: 'boss-12',
        prompt: 'I saw some errors in the document',
        suggestedReplies: [
          'Thanks for catching those! I\'ll review and correct them right away.',
          'Appreciate the heads-up — I\'ll fix them and resend today.',
          'Sorry about that. I\'ll do a thorough review and update ASAP.',
        ],
      },
      {
        id: 'boss-13',
        prompt: 'Are you available this weekend?',
        suggestedReplies: [
          'I can make myself available — what do you need?',
          'I have some flexibility. What\'s the situation?',
          'I can be — is it urgent or can it wait until Monday?',
        ],
      },
      {
        id: 'boss-14',
        prompt: 'Share your update in the team meeting',
        suggestedReplies: [
          'Will do! I\'ll have a quick summary ready.',
          'Sure thing — should I prepare any slides or just a verbal update?',
          'Got it! How much time should I plan for?',
        ],
      },
      {
        id: 'boss-15',
        prompt: 'I need you to lead this initiative',
        suggestedReplies: [
          'I\'m honored! I\'ll put together a plan and run it by you.',
          'Thank you for the trust. Can we align on expectations this week?',
          'I\'m ready for it! I\'ll start by mapping out the key milestones.',
        ],
      },
      {
        id: 'boss-16',
        prompt: 'This isn\'t what I asked for',
        suggestedReplies: [
          'I apologize for the misunderstanding. Can we quickly align so I can redo it correctly?',
          'Sorry about that — let me clarify what you need and I\'ll revise it today.',
          'My mistake. I\'ll take another pass. What specifically should I change?',
        ],
      },
      {
        id: 'boss-17',
        prompt: 'Keep up the good work',
        suggestedReplies: [
          'Thank you! I really enjoy working on this team.',
          'Appreciate the encouragement! I\'ll keep pushing.',
          'Thanks — that motivates me to keep going!',
        ],
      },
      {
        id: 'boss-18',
        prompt: 'Can we reschedule our meeting?',
        suggestedReplies: [
          'Of course! What time works better for you?',
          'No problem — I\'m flexible. Just let me know.',
          'Sure thing! I\'ll send some alternative slots.',
        ],
      },
      {
        id: 'boss-19',
        prompt: 'What\'s the status on the project?',
        suggestedReplies: [
          'We\'re on track! I\'ll send you a detailed update by EOD.',
          'Making good progress — about 75% done. Should be wrapped up by [date].',
          'Everything\'s moving forward. Want me to put together a quick status report?',
        ],
      },
      {
        id: 'boss-20',
        prompt: 'I\'m not sure this approach will work',
        suggestedReplies: [
          'I hear you — what concerns do you have? I\'m open to adjusting.',
          'Fair point. Would you like me to explore an alternative approach?',
          'I appreciate the feedback. Let me come back with a revised plan.',
        ],
      },
    ],
  },
  {
    id: 'teacher-parent',
    title: 'Teacher / Parent Replies',
    description: 'Quick replies for school-related messages and parent communication.',
    emoji: '📚',
    color: 'violet',
    examples: [
      {
        id: 'tp-1',
        prompt: 'Your child forgot their homework',
        suggestedReplies: [
          'Thank you for letting me know! I\'ll make sure they bring it tomorrow.',
          'I appreciate the heads-up. We\'ll work on it tonight.',
          'Sorry about that — I\'ll remind them to pack it tonight.',
        ],
      },
      {
        id: 'tp-2',
        prompt: 'Please sign the form',
        suggestedReplies: [
          'Will do! I\'ll send it back with them tomorrow morning.',
          'Got it — signing it tonight. Thanks for the reminder!',
          'Thanks for letting me know! I\'ll have it signed and returned ASAP.',
        ],
      },
      {
        id: 'tp-3',
        prompt: 'Reminder about tomorrow\'s event',
        suggestedReplies: [
          'Thanks for the reminder! We\'ll be there.',
          'Appreciate it! Is there anything we should bring?',
          'Got it — looking forward to it! What time should we arrive?',
        ],
      },
      {
        id: 'tp-4',
        prompt: 'Your child had a great day today',
        suggestedReplies: [
          'That\'s wonderful to hear! Thank you for sharing!',
          'Made my day! Thanks so much for letting us know.',
          'So happy to hear that! We\'ll celebrate at home tonight.',
        ],
      },
      {
        id: 'tp-5',
        prompt: 'Can we schedule a parent-teacher conference?',
        suggestedReplies: [
          'Absolutely! I\'m available [days]. What time works for you?',
          'Of course. I can do mornings or after 3 PM. Let me know your preference.',
          'I\'d appreciate that. Can you share some available times?',
        ],
      },
      {
        id: 'tp-6',
        prompt: 'Your child isn\'t turning in assignments',
        suggestedReplies: [
          'Thank you for bringing this to my attention. We\'ll address it at home tonight.',
          'I appreciate you letting us know. Can you send me a list of what\'s missing?',
          'I\'m sorry to hear that. We\'ll sit down together and get caught up this week.',
        ],
      },
      {
        id: 'tp-7',
        prompt: 'School will be closed tomorrow due to weather',
        suggestedReplies: [
          'Thanks for the heads-up! Stay safe everyone.',
          'Got it — we\'ll adjust our plans. Thanks for the notice!',
          'Understood. Will there be any remote learning assignments?',
        ],
      },
      {
        id: 'tp-8',
        prompt: 'Your child needs extra supplies',
        suggestedReplies: [
          'Thanks for letting me know! I\'ll send everything in tomorrow.',
          'Got it — can you send me a list of what they need?',
          'No problem! I\'ll pick them up today.',
        ],
      },
      {
        id: 'tp-9',
        prompt: 'Picture day is next Friday',
        suggestedReplies: [
          'Thanks for the reminder! We\'ll have them picture-ready.',
          'Got it — do we need to order photos in advance?',
          'Thanks! Is there a dress code or theme?',
        ],
      },
      {
        id: 'tp-10',
        prompt: 'Your child got into a disagreement with another student',
        suggestedReplies: [
          'Thank you for letting me know. I\'ll talk to them about it tonight.',
          'I appreciate the heads-up. Can you share more details so I can address it?',
          'Thanks for informing us. Is there anything we should do on our end?',
        ],
      },
      {
        id: 'tp-11',
        prompt: 'Volunteers needed for the school bake sale',
        suggestedReplies: [
          'I\'d love to help! What do you need?',
          'Count me in! Should I bring baked goods or help at the table?',
          'I can volunteer! What day and time?',
        ],
      },
      {
        id: 'tp-12',
        prompt: 'Your child is excelling in math',
        suggestedReplies: [
          'That\'s so great to hear! We\'ve been practicing together at home.',
          'Thank you! Are there any enrichment opportunities they could try?',
          'Wonderful! We\'re really proud of them.',
        ],
      },
      {
        id: 'tp-13',
        prompt: 'Field trip permission slip is due',
        suggestedReplies: [
          'I\'ll sign and send it tomorrow — thanks for the reminder!',
          'Got it! Is there a fee to include?',
          'Will do! They\'re really excited about the trip.',
        ],
      },
      {
        id: 'tp-14',
        prompt: 'Your child wasn\'t feeling well today',
        suggestedReplies: [
          'Thank you for keeping an eye on them! I\'ll take it from here.',
          'I appreciate the call. Should I come pick them up?',
          'Thanks for letting me know — we\'ll monitor them at home tonight.',
        ],
      },
      {
        id: 'tp-15',
        prompt: 'Report cards will be sent home Friday',
        suggestedReplies: [
          'Thanks for the heads-up! Looking forward to seeing it.',
          'Great, thanks! Is there anything specific we should review?',
          'Appreciate the notice! We\'ll go over it together this weekend.',
        ],
      },
      {
        id: 'tp-16',
        prompt: 'Your child has been very helpful in class',
        suggestedReplies: [
          'That warms my heart! Thank you for sharing.',
          'So proud to hear that! We encourage kindness at home.',
          'What a nice thing to hear — thanks for letting us know!',
        ],
      },
      {
        id: 'tp-17',
        prompt: 'Can you send lunch money?',
        suggestedReplies: [
          'Of course! I\'ll send it in tomorrow. How much do they need?',
          'Oops, will do! Is there a way to pay online?',
          'Got it — I\'ll load their account today. Thanks for the reminder!',
        ],
      },
      {
        id: 'tp-18',
        prompt: 'Your child left their jacket at school',
        suggestedReplies: [
          'Thanks for letting me know! I\'ll grab it at pickup tomorrow.',
          'Appreciate it! Can you hold it in the lost and found?',
          'Oh no, again! 😅 We\'ll pick it up. Thanks!',
        ],
      },
      {
        id: 'tp-19',
        prompt: 'Homework is posted on the class website',
        suggestedReplies: [
          'Perfect, thanks! We\'ll check it tonight.',
          'Got it — appreciate the update!',
          'Thanks! Is there a deadline for the assignments?',
        ],
      },
      {
        id: 'tp-20',
        prompt: 'Early dismissal on Wednesday',
        suggestedReplies: [
          'Thanks for the heads-up! What time should we pick up?',
          'Got it — I\'ll make arrangements. Thanks!',
          'Noted! Will after-school care still be available?',
        ],
      },
    ],
  },
  {
    id: 'busy-replies',
    title: 'Busy Replies',
    description: 'Polite ways to say you\'re busy without being rude.',
    emoji: '⏰',
    color: 'amber',
    examples: [
      {
        id: 'busy-1',
        prompt: 'Can\'t talk right now',
        suggestedReplies: [
          'No worries! Just text me when you\'re free.',
          'All good — shoot me a message whenever!',
          'Understood! I\'ll catch you later.',
        ],
      },
      {
        id: 'busy-2',
        prompt: 'I\'ll get back to you later',
        suggestedReplies: [
          'Sounds good, no rush!',
          'Take your time! I\'ll be around.',
          'Perfect — just hit me up whenever.',
        ],
      },
      {
        id: 'busy-3',
        prompt: 'Running late',
        suggestedReplies: [
          'No worries, take your time! I\'ll be here.',
          'All good! How far out are you?',
          'No rush — I\'ll grab a coffee while I wait.',
        ],
      },
      {
        id: 'busy-4',
        prompt: 'Swamped at work right now',
        suggestedReplies: [
          'I hear you — hang in there! Let\'s catch up later.',
          'No worries, don\'t let me add to your plate!',
          'Been there! Take care of business and text me later.',
        ],
      },
      {
        id: 'busy-5',
        prompt: 'Let me check my schedule',
        suggestedReplies: [
          'Sure, no rush! Just let me know.',
          'Take your time — I\'m flexible.',
          'Sounds good! I\'m pretty open this week.',
        ],
      },
      {
        id: 'busy-6',
        prompt: 'I\'m in a meeting',
        suggestedReplies: [
          'No worries, I\'ll message later!',
          'Got it — shoot me a text when you\'re done.',
          'All good! Talk after your meeting.',
        ],
      },
      {
        id: 'busy-7',
        prompt: 'Can we do this another time?',
        suggestedReplies: [
          'Of course! When works better for you?',
          'Totally fine — just name the day.',
          'No problem at all. Let\'s find a time that works.',
        ],
      },
      {
        id: 'busy-8',
        prompt: 'Sorry, got caught up with something',
        suggestedReplies: [
          'No worries! Everything okay?',
          'All good — life happens! Are you free now?',
          'Don\'t sweat it! Let\'s reschedule.',
        ],
      },
      {
        id: 'busy-9',
        prompt: 'I need a rain check',
        suggestedReplies: [
          'Absolutely! We\'ll make it happen another time.',
          'No problem at all — let me know when you\'re free!',
          'Rain check accepted! Hope everything\'s alright.',
        ],
      },
      {
        id: 'busy-10',
        prompt: 'I\'m driving, can\'t text',
        suggestedReplies: [
          'Stay safe! Text me when you get there.',
          'No worries — drive safe and hit me up later!',
          'All good, safety first! Talk soon.',
        ],
      },
      {
        id: 'busy-11',
        prompt: 'Super busy week',
        suggestedReplies: [
          'I get it! Let\'s catch up when things calm down.',
          'Hang in there! No rush on anything from my end.',
          'Hope you get some rest this weekend! We can talk then.',
        ],
      },
      {
        id: 'busy-12',
        prompt: 'I\'ll try to make it but no promises',
        suggestedReplies: [
          'No pressure! Would love to see you but totally understand.',
          'Just come if you can — no stress either way!',
          'All good! The invite is always open.',
        ],
      },
      {
        id: 'busy-13',
        prompt: 'Heading into an appointment',
        suggestedReplies: [
          'Good luck! Talk to you after.',
          'No worries, catch you later!',
          'Got it — hope everything goes well!',
        ],
      },
      {
        id: 'busy-14',
        prompt: 'I\'m exhausted, can we talk tomorrow?',
        suggestedReplies: [
          'Of course! Get some rest and we\'ll catch up tomorrow.',
          'Absolutely — take it easy tonight!',
          'No problem at all. Sleep well and text me in the morning!',
        ],
      },
      {
        id: 'busy-15',
        prompt: 'Sorry, my phone was on silent',
        suggestedReplies: [
          'No worries! Glad you got back to me.',
          'Ha, mine is always on silent too! What\'s up?',
          'All good! I figured you were busy.',
        ],
      },
      {
        id: 'busy-16',
        prompt: 'I have back-to-back meetings today',
        suggestedReplies: [
          'Oof, that sounds rough. How about we connect tomorrow?',
          'No worries — I know how that goes. Let me know when you have a break.',
          'Hang in there! We can chat whenever you\'re free.',
        ],
      },
      {
        id: 'busy-17',
        prompt: 'On vacation, limited service',
        suggestedReplies: [
          'Enjoy your vacation! This can totally wait.',
          'No rush at all — have an amazing trip!',
          'Have fun! We\'ll sort this out when you\'re back.',
        ],
      },
      {
        id: 'busy-18',
        prompt: 'Not a good time',
        suggestedReplies: [
          'Understood — just reach out whenever you\'re ready.',
          'No problem! Take care of what you need to.',
          'Got it. I\'m here whenever works for you.',
        ],
      },
      {
        id: 'busy-19',
        prompt: 'Putting the kids to bed, brb',
        suggestedReplies: [
          'Take your time! No rush at all.',
          'Good luck! 😂 I\'ll be here when you\'re done.',
          'No worries — the bedtime struggle is real!',
        ],
      },
      {
        id: 'busy-20',
        prompt: 'Working on a deadline',
        suggestedReplies: [
          'You got this! Let me know when you come up for air.',
          'Go crush that deadline! We can talk later.',
          'Don\'t let me distract you — good luck!',
        ],
      },
    ],
  },
];

export function getPackById(id: string): ReplyPack | undefined {
  return REPLY_PACKS.find((p) => p.id === id);
}
