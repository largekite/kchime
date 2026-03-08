import type { ReplyPack } from '@/types';

// Synced from iOS: KChime/Models/ReplyPack.swift
// Field names match iOS: scenarios, message, context, seedReplies
// Colors match iOS: orange, teal, green, red

export const REPLY_PACKS: ReplyPack[] = [
  {
    id: 'awkward-fixes',
    title: 'Awkward Message Fixes',
    description: 'Smooth replies for those cringe-worthy moments we all dread.',
    emoji: '😬',
    color: 'orange',
    scenarios: [
      {
        id: 'awk-1',
        message: 'Sorry I just saw this',
        context: 'Someone apologizing for a late reply',
        seedReplies: [
          'No worries at all! What\'s up?',
          'Haha all good, I do the same thing. What did you need?',
          'No stress! I figured you were busy.',
        ],
      },
      {
        id: 'awk-2',
        message: 'Just checking in',
        context: 'Someone following up on you',
        seedReplies: [
          'Hey! Thanks for checking in — everything\'s good on my end.',
          'Appreciate it! I was actually going to reach out to you.',
          'All good here! How about you?',
        ],
      },
      {
        id: 'awk-3',
        message: 'Following up',
        context: 'Someone nudging you for a response',
        seedReplies: [
          'Thanks for the nudge! I\'ll have it to you by end of day.',
          'Appreciate the follow-up — here\'s where things stand.',
          'Got it, sorry for the delay. Let me get back to you shortly.',
        ],
      },
      {
        id: 'awk-4',
        message: 'My bad, I forgot',
        context: 'Someone admitting they forgot something',
        seedReplies: [
          'No worries, it happens! Just send it whenever you can.',
          'All good! I forget stuff all the time too.',
          'Don\'t sweat it — whenever you get a chance is fine.',
        ],
      },
      {
        id: 'awk-5',
        message: 'I didn\'t mean it like that',
        context: 'Someone trying to clarify a misunderstood message',
        seedReplies: [
          'No worries, I figured it came out wrong. We\'re good!',
          'Haha I know what you meant! Don\'t worry about it.',
          'All good — tone is hard over text!',
        ],
      },
      {
        id: 'awk-6',
        message: 'Oops wrong person',
        context: 'Someone sent a message to the wrong chat',
        seedReplies: [
          'Ha! No worries, happens to the best of us.',
          'Lol I was so confused for a sec 😂',
          'Classic wrong-chat moment! All good.',
        ],
      },
      {
        id: 'awk-7',
        message: 'Are you mad at me?',
        context: 'Someone worried about your feelings',
        seedReplies: [
          'Not at all! Sorry if my texts came off that way.',
          'No way! I\'ve just been super busy. We\'re totally fine.',
          'Nope! Just been in my own world lately. What\'s up?',
        ],
      },
      {
        id: 'awk-8',
        message: 'Why didn\'t you reply?',
        context: 'Someone calling out a lack of response',
        seedReplies: [
          'Sorry, my notifications have been a mess! What\'s up?',
          'Ugh, I saw it and forgot to respond. My bad!',
          'I was meaning to but got sidetracked. I\'m here now!',
        ],
      },
      {
        id: 'awk-9',
        message: 'Did you get my last message?',
        context: 'Someone double-checking if you saw their text',
        seedReplies: [
          'Yes! Sorry, been meaning to get back to you. Here\'s the deal...',
          'I did! Just haven\'t had a chance to respond yet.',
          'Yep, got it! Let me circle back in a bit.',
        ],
      },
      {
        id: 'awk-10',
        message: 'We need to talk',
        context: 'Someone initiating a serious conversation',
        seedReplies: [
          'Sure, what\'s on your mind? I\'m free now.',
          'Of course — is everything okay?',
          'Okay, I\'m all ears. When works for you?',
        ],
      },
      {
        id: 'awk-11',
        message: 'That was awkward lol',
        context: 'Someone acknowledging an awkward moment',
        seedReplies: [
          'Haha yeah, let\'s just pretend that didn\'t happen 😂',
          'LOL I\'m glad I\'m not the only one who noticed!',
          'So awkward 😅 But honestly it\'s fine!',
        ],
      },
      {
        id: 'awk-12',
        message: 'I think there was a misunderstanding',
        context: 'Someone trying to clear up confusion',
        seedReplies: [
          'Totally — let\'s clear it up! What did you mean?',
          'Yeah I think so too. No hard feelings on my end.',
          'Agreed! Let\'s start fresh. Here\'s what I was trying to say...',
        ],
      },
      {
        id: 'awk-13',
        message: 'Sorry for the late reply',
        context: 'Someone apologizing for delayed response',
        seedReplies: [
          'No worries at all — better late than never!',
          'All good! I\'m just glad you got back to me.',
          'Don\'t even worry about it. What\'s going on?',
        ],
      },
      {
        id: 'awk-14',
        message: 'I hope I\'m not bothering you',
        context: 'Someone being polite about reaching out',
        seedReplies: [
          'Not at all! What do you need?',
          'You\'re totally fine! I\'m happy to help.',
          'Never a bother! What\'s up?',
        ],
      },
      {
        id: 'awk-15',
        message: 'Can I be honest with you?',
        context: 'Someone wanting to share something difficult',
        seedReplies: [
          'Of course! I appreciate honesty.',
          'Always. Go ahead, I\'m listening.',
          'Sure thing — I\'d rather hear the truth.',
        ],
      },
      {
        id: 'awk-16',
        message: 'I don\'t know how to say this',
        context: 'Someone struggling to express themselves',
        seedReplies: [
          'Take your time — I\'m here whenever you\'re ready.',
          'No pressure. Just say it however feels right.',
          'I appreciate you wanting to talk. Go ahead.',
        ],
      },
      {
        id: 'awk-17',
        message: 'That came out wrong',
        context: 'Someone realizing their message sounded off',
        seedReplies: [
          'No worries, I get what you meant!',
          'Ha, we\'ve all been there. What were you trying to say?',
          'Don\'t even trip — I know you didn\'t mean it that way.',
        ],
      },
      {
        id: 'awk-18',
        message: 'Sorry I cancelled last minute',
        context: 'Someone apologizing for bailing on plans',
        seedReplies: [
          'No worries! These things happen. Let\'s reschedule.',
          'All good — life gets crazy sometimes!',
          'Don\'t stress about it! When are you free next?',
        ],
      },
      {
        id: 'awk-19',
        message: 'I forgot your name',
        context: 'Someone admitting they forgot your name',
        seedReplies: [
          'Haha no worries! I\'m terrible with names too. It\'s [name].',
          'Don\'t feel bad — happens to everyone! I\'m [name].',
          'All good! Names are hard. I\'m [name], nice to re-meet you!',
        ],
      },
      {
        id: 'awk-20',
        message: 'I accidentally liked your old photo',
        context: 'Someone embarrassed about deep-scrolling your profile',
        seedReplies: [
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
    color: 'teal',
    scenarios: [
      {
        id: 'boss-1',
        message: 'Can you send the report tonight?',
        context: 'Manager requesting deliverable urgently',
        seedReplies: [
          'Absolutely, I\'ll have it in your inbox by end of day.',
          'Sure thing! I\'m wrapping it up now — should be ready within the hour.',
          'I\'m on it. Any specific format you prefer?',
        ],
      },
      {
        id: 'boss-2',
        message: 'Can we jump on a call?',
        context: 'Manager requesting an impromptu call',
        seedReplies: [
          'Of course! I\'m free now, or I can do anytime this afternoon.',
          'Sure! Want me to send a calendar invite? What time works?',
          'Absolutely — I\'ll call you in 5. Does that work?',
        ],
      },
      {
        id: 'boss-3',
        message: 'Please fix this',
        context: 'Manager pointing out an issue',
        seedReplies: [
          'On it! I\'ll take another look and get it corrected ASAP.',
          'Got it — I see the issue. I\'ll have the updated version shortly.',
          'Will do! Thanks for catching that. I\'ll send the fix today.',
        ],
      },
      {
        id: 'boss-4',
        message: 'Did you complete the task?',
        context: 'Manager checking on progress',
        seedReplies: [
          'Yes, all done! I sent it over earlier today.',
          'Almost there — I\'m about 90% finished. Will wrap up within the hour.',
          'I did! Let me know if you need any changes.',
        ],
      },
      {
        id: 'boss-5',
        message: 'We need to discuss your performance',
        context: 'Manager initiating a performance conversation',
        seedReplies: [
          'Of course, I\'d appreciate the feedback. When works best for you?',
          'I\'m open to that conversation. Should I block some time on your calendar?',
          'Sounds good — I\'d love to hear your thoughts. I\'m free this afternoon.',
        ],
      },
      {
        id: 'boss-6',
        message: 'Can you take on this extra project?',
        context: 'Manager delegating additional work',
        seedReplies: [
          'I\'d be happy to! Can you give me a quick overview of the timeline?',
          'Sure, I can make it work. Should I reprioritize anything else?',
          'Absolutely — I\'m interested. Let me know the details and deadline.',
        ],
      },
      {
        id: 'boss-7',
        message: 'Why wasn\'t this done on time?',
        context: 'Manager addressing a missed deadline',
        seedReplies: [
          'You\'re right, and I apologize. I ran into [issue] — here\'s my plan to get it done today.',
          'I take responsibility for the delay. I\'ll have it completed by [time].',
          'Sorry about that. I underestimated the scope. It\'s my top priority now.',
        ],
      },
      {
        id: 'boss-8',
        message: 'Great job on the presentation',
        context: 'Manager giving positive feedback',
        seedReplies: [
          'Thank you so much! I really appreciate the feedback.',
          'That means a lot — thanks for the opportunity to present!',
          'Thanks! The team really helped pull it together.',
        ],
      },
      {
        id: 'boss-9',
        message: 'I need this by tomorrow morning',
        context: 'Manager setting a tight deadline',
        seedReplies: [
          'Understood! I\'ll prioritize it and have it ready first thing.',
          'Got it — I\'ll stay on top of it tonight and deliver by morning.',
          'Consider it done! I\'ll send it over before 9 AM.',
        ],
      },
      {
        id: 'boss-10',
        message: 'Can you cover for Sarah while she\'s out?',
        context: 'Manager asking you to cover for a colleague',
        seedReplies: [
          'Of course! Can she brief me on her current priorities?',
          'Happy to help. I\'ll check in with her before she leaves.',
          'Sure thing. How long will she be out?',
        ],
      },
      {
        id: 'boss-11',
        message: 'Let\'s set up a weekly check-in',
        context: 'Manager proposing recurring meetings',
        seedReplies: [
          'Great idea! What day and time work best for you?',
          'I\'d love that — I\'ll send over some time options.',
          'Sounds good! I\'ll block out a recurring slot.',
        ],
      },
      {
        id: 'boss-12',
        message: 'I saw some errors in the document',
        context: 'Manager flagging mistakes in your work',
        seedReplies: [
          'Thanks for catching those! I\'ll review and correct them right away.',
          'Appreciate the heads-up — I\'ll fix them and resend today.',
          'Sorry about that. I\'ll do a thorough review and update ASAP.',
        ],
      },
      {
        id: 'boss-13',
        message: 'Are you available this weekend?',
        context: 'Manager asking about weekend availability',
        seedReplies: [
          'I can make myself available — what do you need?',
          'I have some flexibility. What\'s the situation?',
          'I can be — is it urgent or can it wait until Monday?',
        ],
      },
      {
        id: 'boss-14',
        message: 'Share your update in the team meeting',
        context: 'Manager asking you to present at standup',
        seedReplies: [
          'Will do! I\'ll have a quick summary ready.',
          'Sure thing — should I prepare any slides or just a verbal update?',
          'Got it! How much time should I plan for?',
        ],
      },
      {
        id: 'boss-15',
        message: 'I need you to lead this initiative',
        context: 'Manager giving you more responsibility',
        seedReplies: [
          'I\'m honored! I\'ll put together a plan and run it by you.',
          'Thank you for the trust. Can we align on expectations this week?',
          'I\'m ready for it! I\'ll start by mapping out the key milestones.',
        ],
      },
      {
        id: 'boss-16',
        message: 'This isn\'t what I asked for',
        context: 'Manager expressing dissatisfaction with deliverable',
        seedReplies: [
          'I apologize for the misunderstanding. Can we quickly align so I can redo it correctly?',
          'Sorry about that — let me clarify what you need and I\'ll revise it today.',
          'My mistake. I\'ll take another pass. What specifically should I change?',
        ],
      },
      {
        id: 'boss-17',
        message: 'Keep up the good work',
        context: 'Manager giving casual encouragement',
        seedReplies: [
          'Thank you! I really enjoy working on this team.',
          'Appreciate the encouragement! I\'ll keep pushing.',
          'Thanks — that motivates me to keep going!',
        ],
      },
      {
        id: 'boss-18',
        message: 'Can we reschedule our meeting?',
        context: 'Manager needing to move a scheduled meeting',
        seedReplies: [
          'Of course! What time works better for you?',
          'No problem — I\'m flexible. Just let me know.',
          'Sure thing! I\'ll send some alternative slots.',
        ],
      },
      {
        id: 'boss-19',
        message: 'What\'s the status on the project?',
        context: 'Manager asking for a project update',
        seedReplies: [
          'We\'re on track! I\'ll send you a detailed update by EOD.',
          'Making good progress — about 75% done. Should be wrapped up by [date].',
          'Everything\'s moving forward. Want me to put together a quick status report?',
        ],
      },
      {
        id: 'boss-20',
        message: 'I\'m not sure this approach will work',
        context: 'Manager expressing concern about your strategy',
        seedReplies: [
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
    color: 'green',
    scenarios: [
      {
        id: 'tp-1',
        message: 'Your child forgot their homework',
        context: 'Teacher notifying about missing homework',
        seedReplies: [
          'Thank you for letting me know! I\'ll make sure they bring it tomorrow.',
          'I appreciate the heads-up. We\'ll work on it tonight.',
          'Sorry about that — I\'ll remind them to pack it tonight.',
        ],
      },
      {
        id: 'tp-2',
        message: 'Please sign the form',
        context: 'School requesting a signed permission form',
        seedReplies: [
          'Will do! I\'ll send it back with them tomorrow morning.',
          'Got it — signing it tonight. Thanks for the reminder!',
          'Thanks for letting me know! I\'ll have it signed and returned ASAP.',
        ],
      },
      {
        id: 'tp-3',
        message: 'Reminder about tomorrow\'s event',
        context: 'School reminding about upcoming event',
        seedReplies: [
          'Thanks for the reminder! We\'ll be there.',
          'Appreciate it! Is there anything we should bring?',
          'Got it — looking forward to it! What time should we arrive?',
        ],
      },
      {
        id: 'tp-4',
        message: 'Your child had a great day today',
        context: 'Teacher sharing positive news',
        seedReplies: [
          'That\'s wonderful to hear! Thank you for sharing!',
          'Made my day! Thanks so much for letting us know.',
          'So happy to hear that! We\'ll celebrate at home tonight.',
        ],
      },
      {
        id: 'tp-5',
        message: 'Can we schedule a parent-teacher conference?',
        context: 'Teacher requesting a meeting',
        seedReplies: [
          'Absolutely! I\'m available [days]. What time works for you?',
          'Of course. I can do mornings or after 3 PM. Let me know your preference.',
          'I\'d appreciate that. Can you share some available times?',
        ],
      },
      {
        id: 'tp-6',
        message: 'Your child isn\'t turning in assignments',
        context: 'Teacher flagging missing work',
        seedReplies: [
          'Thank you for bringing this to my attention. We\'ll address it at home tonight.',
          'I appreciate you letting us know. Can you send me a list of what\'s missing?',
          'I\'m sorry to hear that. We\'ll sit down together and get caught up this week.',
        ],
      },
      {
        id: 'tp-7',
        message: 'School will be closed tomorrow due to weather',
        context: 'School announcing closure',
        seedReplies: [
          'Thanks for the heads-up! Stay safe everyone.',
          'Got it — we\'ll adjust our plans. Thanks for the notice!',
          'Understood. Will there be any remote learning assignments?',
        ],
      },
      {
        id: 'tp-8',
        message: 'Your child needs extra supplies',
        context: 'Teacher requesting additional materials',
        seedReplies: [
          'Thanks for letting me know! I\'ll send everything in tomorrow.',
          'Got it — can you send me a list of what they need?',
          'No problem! I\'ll pick them up today.',
        ],
      },
      {
        id: 'tp-9',
        message: 'Picture day is next Friday',
        context: 'School reminder for picture day',
        seedReplies: [
          'Thanks for the reminder! We\'ll have them picture-ready.',
          'Got it — do we need to order photos in advance?',
          'Thanks! Is there a dress code or theme?',
        ],
      },
      {
        id: 'tp-10',
        message: 'Your child got into a disagreement with another student',
        context: 'Teacher reporting a conflict',
        seedReplies: [
          'Thank you for letting me know. I\'ll talk to them about it tonight.',
          'I appreciate the heads-up. Can you share more details so I can address it?',
          'Thanks for informing us. Is there anything we should do on our end?',
        ],
      },
      {
        id: 'tp-11',
        message: 'Volunteers needed for the school bake sale',
        context: 'School seeking parent volunteers',
        seedReplies: [
          'I\'d love to help! What do you need?',
          'Count me in! Should I bring baked goods or help at the table?',
          'I can volunteer! What day and time?',
        ],
      },
      {
        id: 'tp-12',
        message: 'Your child is excelling in math',
        context: 'Teacher sharing academic achievement',
        seedReplies: [
          'That\'s so great to hear! We\'ve been practicing together at home.',
          'Thank you! Are there any enrichment opportunities they could try?',
          'Wonderful! We\'re really proud of them.',
        ],
      },
      {
        id: 'tp-13',
        message: 'Field trip permission slip is due',
        context: 'School requesting signed permission slip',
        seedReplies: [
          'I\'ll sign and send it tomorrow — thanks for the reminder!',
          'Got it! Is there a fee to include?',
          'Will do! They\'re really excited about the trip.',
        ],
      },
      {
        id: 'tp-14',
        message: 'Your child wasn\'t feeling well today',
        context: 'Teacher or nurse notifying about illness',
        seedReplies: [
          'Thank you for keeping an eye on them! I\'ll take it from here.',
          'I appreciate the call. Should I come pick them up?',
          'Thanks for letting me know — we\'ll monitor them at home tonight.',
        ],
      },
      {
        id: 'tp-15',
        message: 'Report cards will be sent home Friday',
        context: 'School announcing report card distribution',
        seedReplies: [
          'Thanks for the heads-up! Looking forward to seeing it.',
          'Great, thanks! Is there anything specific we should review?',
          'Appreciate the notice! We\'ll go over it together this weekend.',
        ],
      },
      {
        id: 'tp-16',
        message: 'Your child has been very helpful in class',
        context: 'Teacher sharing positive behavior',
        seedReplies: [
          'That warms my heart! Thank you for sharing.',
          'So proud to hear that! We encourage kindness at home.',
          'What a nice thing to hear — thanks for letting us know!',
        ],
      },
      {
        id: 'tp-17',
        message: 'Can you send lunch money?',
        context: 'School requesting payment for meals',
        seedReplies: [
          'Of course! I\'ll send it in tomorrow. How much do they need?',
          'Oops, will do! Is there a way to pay online?',
          'Got it — I\'ll load their account today. Thanks for the reminder!',
        ],
      },
      {
        id: 'tp-18',
        message: 'Your child left their jacket at school',
        context: 'Teacher notifying about lost item',
        seedReplies: [
          'Thanks for letting me know! I\'ll grab it at pickup tomorrow.',
          'Appreciate it! Can you hold it in the lost and found?',
          'Oh no, again! 😅 We\'ll pick it up. Thanks!',
        ],
      },
      {
        id: 'tp-19',
        message: 'Homework is posted on the class website',
        context: 'Teacher directing to online assignments',
        seedReplies: [
          'Perfect, thanks! We\'ll check it tonight.',
          'Got it — appreciate the update!',
          'Thanks! Is there a deadline for the assignments?',
        ],
      },
      {
        id: 'tp-20',
        message: 'Early dismissal on Wednesday',
        context: 'School announcing schedule change',
        seedReplies: [
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
    color: 'red',
    scenarios: [
      {
        id: 'busy-1',
        message: 'Can\'t talk right now',
        context: 'Someone saying they\'re unavailable',
        seedReplies: [
          'No worries! Just text me when you\'re free.',
          'All good — shoot me a message whenever!',
          'Understood! I\'ll catch you later.',
        ],
      },
      {
        id: 'busy-2',
        message: 'I\'ll get back to you later',
        context: 'Someone deferring the conversation',
        seedReplies: [
          'Sounds good, no rush!',
          'Take your time! I\'ll be around.',
          'Perfect — just hit me up whenever.',
        ],
      },
      {
        id: 'busy-3',
        message: 'Running late',
        context: 'Someone letting you know they\'re behind schedule',
        seedReplies: [
          'No worries, take your time! I\'ll be here.',
          'All good! How far out are you?',
          'No rush — I\'ll grab a coffee while I wait.',
        ],
      },
      {
        id: 'busy-4',
        message: 'Swamped at work right now',
        context: 'Someone overwhelmed with work',
        seedReplies: [
          'I hear you — hang in there! Let\'s catch up later.',
          'No worries, don\'t let me add to your plate!',
          'Been there! Take care of business and text me later.',
        ],
      },
      {
        id: 'busy-5',
        message: 'Let me check my schedule',
        context: 'Someone needing to verify availability',
        seedReplies: [
          'Sure, no rush! Just let me know.',
          'Take your time — I\'m flexible.',
          'Sounds good! I\'m pretty open this week.',
        ],
      },
      {
        id: 'busy-6',
        message: 'I\'m in a meeting',
        context: 'Someone currently in a meeting',
        seedReplies: [
          'No worries, I\'ll message later!',
          'Got it — shoot me a text when you\'re done.',
          'All good! Talk after your meeting.',
        ],
      },
      {
        id: 'busy-7',
        message: 'Can we do this another time?',
        context: 'Someone requesting to reschedule',
        seedReplies: [
          'Of course! When works better for you?',
          'Totally fine — just name the day.',
          'No problem at all. Let\'s find a time that works.',
        ],
      },
      {
        id: 'busy-8',
        message: 'Sorry, got caught up with something',
        context: 'Someone explaining why they were delayed',
        seedReplies: [
          'No worries! Everything okay?',
          'All good — life happens! Are you free now?',
          'Don\'t sweat it! Let\'s reschedule.',
        ],
      },
      {
        id: 'busy-9',
        message: 'I need a rain check',
        context: 'Someone cancelling but wanting to do it later',
        seedReplies: [
          'Absolutely! We\'ll make it happen another time.',
          'No problem at all — let me know when you\'re free!',
          'Rain check accepted! Hope everything\'s alright.',
        ],
      },
      {
        id: 'busy-10',
        message: 'I\'m driving, can\'t text',
        context: 'Someone on the road',
        seedReplies: [
          'Stay safe! Text me when you get there.',
          'No worries — drive safe and hit me up later!',
          'All good, safety first! Talk soon.',
        ],
      },
      {
        id: 'busy-11',
        message: 'Super busy week',
        context: 'Someone explaining they\'re swamped',
        seedReplies: [
          'I get it! Let\'s catch up when things calm down.',
          'Hang in there! No rush on anything from my end.',
          'Hope you get some rest this weekend! We can talk then.',
        ],
      },
      {
        id: 'busy-12',
        message: 'I\'ll try to make it but no promises',
        context: 'Someone unsure if they can attend',
        seedReplies: [
          'No pressure! Would love to see you but totally understand.',
          'Just come if you can — no stress either way!',
          'All good! The invite is always open.',
        ],
      },
      {
        id: 'busy-13',
        message: 'Heading into an appointment',
        context: 'Someone about to be unavailable',
        seedReplies: [
          'Good luck! Talk to you after.',
          'No worries, catch you later!',
          'Got it — hope everything goes well!',
        ],
      },
      {
        id: 'busy-14',
        message: 'I\'m exhausted, can we talk tomorrow?',
        context: 'Someone too tired to continue',
        seedReplies: [
          'Of course! Get some rest and we\'ll catch up tomorrow.',
          'Absolutely — take it easy tonight!',
          'No problem at all. Sleep well and text me in the morning!',
        ],
      },
      {
        id: 'busy-15',
        message: 'Sorry, my phone was on silent',
        context: 'Someone explaining missed calls or texts',
        seedReplies: [
          'No worries! Glad you got back to me.',
          'Ha, mine is always on silent too! What\'s up?',
          'All good! I figured you were busy.',
        ],
      },
      {
        id: 'busy-16',
        message: 'I have back-to-back meetings today',
        context: 'Someone with a packed calendar',
        seedReplies: [
          'Oof, that sounds rough. How about we connect tomorrow?',
          'No worries — I know how that goes. Let me know when you have a break.',
          'Hang in there! We can chat whenever you\'re free.',
        ],
      },
      {
        id: 'busy-17',
        message: 'On vacation, limited service',
        context: 'Someone on vacation with poor connectivity',
        seedReplies: [
          'Enjoy your vacation! This can totally wait.',
          'No rush at all — have an amazing trip!',
          'Have fun! We\'ll sort this out when you\'re back.',
        ],
      },
      {
        id: 'busy-18',
        message: 'Not a good time',
        context: 'Someone indicating bad timing',
        seedReplies: [
          'Understood — just reach out whenever you\'re ready.',
          'No problem! Take care of what you need to.',
          'Got it. I\'m here whenever works for you.',
        ],
      },
      {
        id: 'busy-19',
        message: 'Putting the kids to bed, brb',
        context: 'Parent busy with bedtime routine',
        seedReplies: [
          'Take your time! No rush at all.',
          'Good luck! 😂 I\'ll be here when you\'re done.',
          'No worries — the bedtime struggle is real!',
        ],
      },
      {
        id: 'busy-20',
        message: 'Working on a deadline',
        context: 'Someone under pressure at work',
        seedReplies: [
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
