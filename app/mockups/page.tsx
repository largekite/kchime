'use client';

import PhoneMockup from '@/components/marketing/PhoneMockup';
import UseCaseMockup from '@/components/marketing/UseCaseMockup';
import { Briefcase, MessageCircle, GraduationCap, Clock } from 'lucide-react';

export default function MockupsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ---------------------------------------------------------- */}
      {/*  HEADER                                                      */}
      {/* ---------------------------------------------------------- */}
      <div className="border-b border-gray-100 bg-white px-6 py-5">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
            KChime Marketing Assets
          </p>
          <h1 className="text-2xl font-bold text-gray-900">UI Mockups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hero mockups, use-case cards, and phone frames for website, App Store, and Product Hunt.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  1. HERO PHONE MOCKUPS                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            number="01"
            title="Hero Phone Mockups"
            subtitle="Full iPhone frames with reply suggestions — for hero sections and App Store screenshots."
          />

          <div className="mt-12 grid md:grid-cols-2 gap-16 justify-items-center">
            {/* Scenario 1: Boss */}
            <div className="text-center">
              <PhoneMockup
                contactName="Sarah Chen"
                contactLabel="Manager · Acme Corp"
                incomingMessage="Can you send the report tonight?"
                timestamp="4:32 PM"
                replies={[
                  { text: "Sure — I'll send it tonight.", confidence: 96 },
                  { text: 'Working on it now. Should have it to you within the hour.' },
                  { text: "I'll send it shortly — just finishing up the last section." },
                ]}
                highlightIndex={0}
              />
              <p className="mt-6 text-sm font-semibold text-gray-700">Reply to your boss</p>
              <p className="text-xs text-gray-400 mt-1">Professional · Confident · Instant</p>
            </div>

            {/* Scenario 2: Awkward text */}
            <div className="text-center">
              <PhoneMockup
                contactName="Jamie"
                contactLabel="Friend"
                incomingMessage="Hey, you never responded to my text last week… everything ok?"
                timestamp="9:15 AM"
                replies={[
                  { text: "Sorry about that! Got swamped. I'm good — what's up?", confidence: 94 },
                  { text: 'Ugh, totally slipped my mind. All good here! How are you?' },
                  { text: "My bad — been a crazy week. Nothing's wrong, just busy!" },
                ]}
                highlightIndex={0}
              />
              <p className="mt-6 text-sm font-semibold text-gray-700">Fix awkward texts</p>
              <p className="text-xs text-gray-400 mt-1">Natural · Warm · No overthinking</p>
            </div>

            {/* Scenario 3: Teacher */}
            <div className="text-center">
              <PhoneMockup
                contactName="Ms. Rodriguez"
                contactLabel="3rd Grade Teacher"
                incomingMessage="Your child forgot the folder today. Could you bring it by the office?"
                timestamp="10:20 AM"
                replies={[
                  { text: "Thank you for letting me know — I'll drop it off before lunch.", confidence: 97 },
                  { text: 'So sorry about that! I can bring it within the next hour.' },
                  { text: "Thanks for the heads up. I'll have it there by 11." },
                ]}
                highlightIndex={0}
              />
              <p className="mt-6 text-sm font-semibold text-gray-700">Handle school messages</p>
              <p className="text-xs text-gray-400 mt-1">Polite · Responsive · Parent-friendly</p>
            </div>

            {/* Scenario 4: Client */}
            <div className="text-center">
              <PhoneMockup
                contactName="David Park"
                contactLabel="Client · Horizon Media"
                incomingMessage="Just checking in on this — any updates on the proposal?"
                timestamp="2:45 PM"
                replies={[
                  { text: "Thanks for following up — I'll have the updated proposal to you by end of day.", confidence: 95 },
                  { text: "Appreciate the nudge! Finalizing a few details — you'll have it by tomorrow morning." },
                  { text: "Great timing — just wrapping it up. I'll send it over this afternoon." },
                ]}
                highlightIndex={0}
              />
              <p className="mt-6 text-sm font-semibold text-gray-700">Reply when busy</p>
              <p className="text-xs text-gray-400 mt-1">Professional · Reassuring · On-brand</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  2. USE-CASE CARDS                                           */}
      {/* ---------------------------------------------------------- */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            number="02"
            title="Use-Case Cards"
            subtitle="Compact conversation cards — for feature sections, social media, and Product Hunt gallery."
          />

          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            <UseCaseMockup
              icon={<Briefcase className="h-5 w-5" />}
              title="Reply to your boss"
              tag="Work"
              sender="Sarah Chen"
              incomingMessage="Can you send the report tonight?"
              replies={[
                "Sure — I'll send it tonight.",
                'Working on it now. Should have it to you within the hour.',
                "I'll send it shortly — just finishing up.",
              ]}
              highlightIndex={0}
              accentColor="teal"
            />

            <UseCaseMockup
              icon={<MessageCircle className="h-5 w-5" />}
              title="Fix awkward texts"
              tag="Personal"
              sender="Jamie"
              incomingMessage="Hey, you never responded to my text last week… everything ok?"
              replies={[
                "Sorry about that! Got swamped. I'm good — what's up?",
                'Totally slipped my mind. All good here! How are you?',
                "My bad — been a crazy week. Nothing's wrong!",
              ]}
              highlightIndex={0}
              accentColor="violet"
            />

            <UseCaseMockup
              icon={<GraduationCap className="h-5 w-5" />}
              title="Handle school messages"
              tag="Family"
              sender="Ms. Rodriguez"
              incomingMessage="Your child forgot the folder today. Could you bring it by the office?"
              replies={[
                "Thank you for letting me know — I'll drop it off before lunch.",
                'So sorry about that! I can bring it within the next hour.',
                "Thanks for the heads up. I'll have it there by 11.",
              ]}
              highlightIndex={0}
              accentColor="blue"
            />

            <UseCaseMockup
              icon={<Clock className="h-5 w-5" />}
              title="Reply when busy"
              tag="Client"
              sender="David Park"
              incomingMessage="Just checking in on this — any updates on the proposal?"
              replies={[
                "Thanks for following up — I'll have it to you by end of day.",
                "Appreciate the nudge! You'll have it by tomorrow morning.",
                "Great timing — just wrapping up. I'll send it this afternoon.",
              ]}
              highlightIndex={0}
              accentColor="amber"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  3. HERO COMPOSITION — FULL MARKETING HERO                   */}
      {/* ---------------------------------------------------------- */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            number="03"
            title="Full Hero Composition"
            subtitle="Complete hero section layout — ready for website header or Product Hunt banner."
          />

          <div className="mt-12 rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-10 md:p-16 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Copy side */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-500/30 px-4 py-1.5 text-sm font-medium text-teal-300 mb-6">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><circle cx="12" cy="12" r="4" /></svg>
                  AI Reply Assistant
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
                  Never wonder how to reply{' '}
                  <span className="text-teal-400">again.</span>
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-md">
                  KChime suggests the perfect response for texts, emails, and chats — instantly.
                </p>
                <div className="flex flex-wrap gap-4">
                  {/* App Store button */}
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-gray-900">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.34-3.14-2.57C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[10px] font-medium text-gray-500">Download on the</div>
                      <div className="text-sm font-semibold -mt-0.5">App Store</div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 px-6 py-3.5 text-sm font-semibold text-gray-300">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Watch Demo
                  </div>
                </div>
              </div>

              {/* Phone side */}
              <div className="flex justify-center">
                <PhoneMockup
                  contactName="Sarah Chen"
                  contactLabel="Manager · Acme Corp"
                  incomingMessage="Can you send the report tonight?"
                  timestamp="4:32 PM"
                  replies={[
                    { text: "Sure — I'll send it tonight.", confidence: 96 },
                    { text: 'Working on it now.' },
                    { text: "I'll send it shortly." },
                  ]}
                  highlightIndex={0}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  4. APP STORE SCREENSHOT FRAMES                              */}
      {/* ---------------------------------------------------------- */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            number="04"
            title="App Store Screenshot Frames"
            subtitle="Framed phone mockups with captions — sized for App Store preview."
          />

          <div className="mt-12 flex gap-8 overflow-x-auto pb-4 snap-x">
            {[
              {
                caption: 'Reply to your boss\nin seconds',
                contactName: 'Sarah Chen',
                contactLabel: 'Manager',
                msg: 'Can you send the report tonight?',
                replies: [
                  { text: "Sure — I'll send it tonight.", confidence: 96 },
                  { text: 'Working on it now.' },
                  { text: "I'll send it shortly." },
                ],
              },
              {
                caption: 'Fix awkward texts\nwith confidence',
                contactName: 'Jamie',
                contactLabel: 'Friend',
                msg: 'Hey, you never responded to my text last week…',
                replies: [
                  { text: "Sorry about that! I'm good — what's up?", confidence: 94 },
                  { text: 'Totally slipped my mind. How are you?' },
                  { text: "My bad — been a crazy week!" },
                ],
              },
              {
                caption: 'Handle school\nmessages easily',
                contactName: 'Ms. Rodriguez',
                contactLabel: 'Teacher',
                msg: 'Your child forgot the folder today.',
                replies: [
                  { text: "Thanks — I'll drop it off before lunch.", confidence: 97 },
                  { text: 'So sorry! I can bring it within the hour.' },
                  { text: "I'll have it there by 11." },
                ],
              },
              {
                caption: 'Reply to clients\nlike a pro',
                contactName: 'David Park',
                contactLabel: 'Client',
                msg: 'Just checking in — any updates?',
                replies: [
                  { text: "I'll have the proposal to you by end of day.", confidence: 95 },
                  { text: "You'll have it by tomorrow morning." },
                  { text: "Just wrapping up — sending this afternoon." },
                ],
              },
            ].map((item) => (
              <div
                key={item.caption}
                className="shrink-0 snap-center w-[340px] rounded-3xl bg-gradient-to-b from-teal-600 to-teal-800 p-6 pt-8 text-center"
              >
                <p className="text-white font-bold text-lg leading-snug whitespace-pre-line mb-6">
                  {item.caption}
                </p>
                <div className="flex justify-center transform scale-[0.85] origin-top">
                  <PhoneMockup
                    contactName={item.contactName}
                    contactLabel={item.contactLabel}
                    incomingMessage={item.msg}
                    replies={item.replies}
                    highlightIndex={0}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section header helper                                              */
/* ------------------------------------------------------------------ */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-xs font-bold text-teal-700">
          {number}
        </span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 ml-10">{subtitle}</p>
    </div>
  );
}
