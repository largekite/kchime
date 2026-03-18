import Link from 'next/link';
import {
  Zap,
  Shield,
  Smartphone,
  MessageCircle,
  Sparkles,
  Lock,
  Eye,
  SlidersHorizontal,
  Copy,
  Send,
  Star,
  Briefcase,
  GraduationCap,
  Clock,
  Heart,
  Mic,
  Users,
  BookOpen,
  Trophy,
  Flame,
  Dumbbell,
  Wrench,
} from 'lucide-react';
import PhoneMockup from '@/components/marketing/PhoneMockup';

export const metadata = {
  title: 'KChime — Reply Naturally in English, Every Time',
  description:
    'KChime helps you reply to messages in natural English — with AI suggestions, real conversation practice, and a daily learning system. iOS keyboard + web app.',
};

/* ------------------------------------------------------------------ */
/*  Tiny reusable pieces                                               */
/* ------------------------------------------------------------------ */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
      <Zap className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 mb-3">
      {children}
    </p>
  );
}

function AppStoreButton({ className = '' }: { className?: string }) {
  return (
    <a
      href="#"
      className={`inline-flex items-center gap-3 rounded-2xl bg-gray-900 px-7 py-4 text-white hover:bg-gray-800 transition ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.34-3.14-2.57C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <div className="text-left leading-tight">
        <div className="text-[10px] font-medium opacity-80">Download on the</div>
        <div className="text-base font-semibold -mt-0.5">App Store</div>
      </div>
    </a>
  );
}

function WebAppButton() {
  return (
    <Link
      href="/reply"
      className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-7 py-4 text-sm font-semibold text-gray-700 hover:border-teal-200 hover:text-teal-700 transition"
    >
      Try Free on the Web
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Use-case card                                                      */
/* ------------------------------------------------------------------ */

function UseCaseCard({
  icon,
  title,
  incoming,
  reply,
}: {
  icon: React.ReactNode;
  title: string;
  incoming: string;
  reply: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 mb-3">
        <p className="text-[11px] font-medium text-gray-400 mb-1">Incoming</p>
        &ldquo;{incoming}&rdquo;
      </div>
      <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-3 text-sm text-teal-800">
        <p className="text-[11px] font-medium text-teal-500 mb-1">KChime reply</p>
        {reply}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card                                                       */
/* ------------------------------------------------------------------ */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Trust point                                                        */
/* ------------------------------------------------------------------ */

function TrustPoint({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ---------------------------------------------------------- */}
      {/*  NAV                                                        */}
      {/* ---------------------------------------------------------- */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-teal-600">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold tracking-tight">KChime</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/reply"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition hidden sm:block"
            >
              Open Web App
            </Link>
            <a
              href="#"
              className="rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
            >
              Get the App
            </a>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      {/*  1. HERO                                                     */}
      {/* ---------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <Badge>AI Reply Assistant</Badge>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
              Reply naturally in English,{' '}
              <span className="text-teal-600">every time.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
              KChime suggests natural replies for texts, emails, and chats — and helps you practice real conversations so you always know what to say.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <AppStoreButton />
              <WebAppButton />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              iOS keyboard extension + web app. Free to start.
            </p>
          </div>

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
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  2. BENEFIT STRIP                                            */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-950 text-white py-14">
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Zap className="h-6 w-6" />, label: 'Reply instantly' },
            { icon: <Sparkles className="h-6 w-6" />, label: 'Sound natural' },
            { icon: <Dumbbell className="h-6 w-6" />, label: 'Practice daily' },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
                {b.icon}
              </div>
              <p className="text-lg font-semibold">{b.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  3. THREE HUBS — WHAT THE APP ACTUALLY DOES                  */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>What you get</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">Reply, practice, and learn — all in one app.</h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              KChime isn&apos;t just a reply tool. It&apos;s a complete system for sounding natural and confident in English.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Reply Hub */}
            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-5">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reply</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Paste what someone said and get natural reply suggestions instantly. Works for casual texts, work emails, and tricky messages.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Quick Reply — 4 tone options', 'Fix My Message — polish your drafts', 'Work Reply — strategic workplace responses'].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5 shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Practice Hub */}
            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-5">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Practice</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Build confidence with real conversation scenarios — from small talk to workplace banter. Practice with AI voice partners.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {['50+ conversation scenarios', 'AI conversation partner (voice)', 'Live Listen — real-time reply help'].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5 shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Learn Hub */}
            <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-5">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Learn</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Save phrases you like, review them with spaced repetition, and learn a new expression every day with cultural context.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                {['Saved phrase library', 'Spaced repetition review', 'Daily phrase with cultural notes'].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-teal-500 mt-0.5 shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  4. USE CASES                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Use cases</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">One tap. Perfect reply.</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              KChime handles the messages you dread — so you don&apos;t have to overthink them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <UseCaseCard
              icon={<Briefcase className="h-5 w-5" />}
              title="Reply to your boss"
              incoming="Can we move the deadline up to Friday?"
              reply="Absolutely — I'll reprioritize and have it ready by Friday."
            />
            <UseCaseCard
              icon={<Heart className="h-5 w-5" />}
              title="Fix awkward texts"
              incoming="Hey, sorry I missed your birthday… hope it was great!"
              reply="No worries at all! It was a good one. Thanks for thinking of me."
            />
            <UseCaseCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Handle school messages"
              incoming="Please send the signed permission form by Monday."
              reply="Thanks for the reminder — I'll have it signed and sent over by Monday morning."
            />
            <UseCaseCard
              icon={<Clock className="h-5 w-5" />}
              title="Reply when busy"
              incoming="Are you coming to the meeting at 3?"
              reply="On my way — running 5 minutes behind. Start without me if needed."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  5. HOW IT WORKS                                             */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">Three steps. Zero stress.</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                step: '1',
                icon: <Copy className="h-6 w-6" />,
                title: 'Paste or speak a message',
                desc: 'Paste what someone said, or use voice input. KChime works on the web or right inside your iPhone keyboard.',
              },
              {
                step: '2',
                icon: <Sparkles className="h-6 w-6" />,
                title: 'Get smart replies',
                desc: 'AI generates natural responses matched to your tone profile, the relationship, and the conversation context.',
              },
              {
                step: '3',
                icon: <Send className="h-6 w-6" />,
                title: 'Copy and send',
                desc: 'Pick the reply you like, copy it, and paste it into any messaging app — iMessage, WhatsApp, Slack, email.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  {s.icon}
                </div>
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  6. FEATURES (real features only)                            */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to reply with confidence</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant AI replies"
              description="Paste what someone said and get 4 natural reply options — casual, professional, short, or detailed."
            />
            <FeatureCard
              icon={<SlidersHorizontal className="h-6 w-6" />}
              title="Personalized tone"
              description="Set your formality, length, and emoji preferences. Create custom tone profiles for different relationships."
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="iOS keyboard extension"
              description="Use KChime right inside iMessage, WhatsApp, or any app — no switching needed. Also available as a web app."
            />
            <FeatureCard
              icon={<Wrench className="h-6 w-6" />}
              title="Fix My Message"
              description="Paste your own draft and get 3 polished rewrites with tone labels and explanations of what was improved."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="AI conversation partner"
              description="Practice real conversations by voice with 12 AI personas — barista, coworker, job interviewer, and more."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Reply packs"
              description="Pre-built response sets for common scenarios — ice breakers, comebacks, work confidence, and more."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  7. GAMIFICATION — streaks, XP, badges                       */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <SectionLabel>Stay motivated</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Build a daily habit.</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                KChime tracks your progress with streaks, XP, and badges — so you stay consistent and see real improvement over time.
              </p>
              <div className="space-y-5">
                {[
                  {
                    icon: <Flame className="h-5 w-5" />,
                    title: 'Daily streaks',
                    text: 'Complete your daily goal to build your streak. The longer you go, the higher your XP multiplier.',
                  },
                  {
                    icon: <Trophy className="h-5 w-5" />,
                    title: '22 badges to earn',
                    text: 'From "First Step" to "Conversation Master" — unlock achievements as you practice and improve.',
                  },
                  {
                    icon: <BookOpen className="h-5 w-5" />,
                    title: 'Spaced repetition',
                    text: 'Save phrases you like and review them at the perfect interval so they stick in your memory.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress visual */}
            <div className="flex justify-center">
              <div className="rounded-3xl bg-white border border-gray-200 p-7 shadow-sm max-w-xs w-full">
                <div className="text-center mb-5">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 mb-3">
                    <Flame className="h-7 w-7 text-teal-600" />
                  </div>
                  <p className="text-3xl font-extrabold text-gray-900">12</p>
                  <p className="text-sm text-gray-500">day streak</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Today&apos;s goal</span>
                      <span className="font-medium text-teal-600">3 / 5</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">Level</span>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Confident</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">XP earned</span>
                    <span className="text-sm font-bold text-gray-900">2,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Badges</span>
                    <span className="text-sm font-bold text-gray-900">8 / 22</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  8. PRIVACY / TRUST                                          */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <SectionLabel>Privacy</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Private by design.</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                We know keyboards see everything. That&apos;s why KChime was built from the ground up to keep your conversations private and secure.
              </p>
              <div className="space-y-6">
                <TrustPoint
                  icon={<Eye className="h-5 w-5" />}
                  title="No message storage"
                  text="Your messages are processed in real time and never saved to our servers."
                />
                <TrustPoint
                  icon={<Lock className="h-5 w-5" />}
                  title="Secure processing"
                  text="All data is encrypted in transit. We use industry-standard security practices."
                />
                <TrustPoint
                  icon={<SlidersHorizontal className="h-5 w-5" />}
                  title="User-controlled inputs"
                  text="You decide what to share. KChime only sees the messages you explicitly paste or speak."
                />
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-3xl bg-white border border-gray-200 p-8 shadow-sm max-w-sm w-full text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Your data stays yours</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Zero data retention. Zero tracking. Zero compromises.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {['Encrypted', 'No logs', 'GDPR ready'].map((label) => (
                    <span key={label} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  9. SOCIAL PROOF / EXAMPLES                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Real life</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">Made for real-life conversations</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              From Monday morning emails to Friday night group chats — KChime has you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: 'Boss',
                msg: 'Can you send the report tonight?',
                reply: 'Sure — I\'ll have it in your inbox by 8 PM.',
              },
              {
                label: 'Teacher',
                msg: 'Reminder: bring the blue folder tomorrow.',
                reply: 'Thank you for the reminder! We\'ll have it ready.',
              },
              {
                label: 'Client',
                msg: 'Just following up on the proposal from last week.',
                reply: 'Thanks for following up — I\'ll send the updated version today.',
              },
              {
                label: 'Friend',
                msg: 'Sorry I never replied to your text last week 😅',
                reply: 'Ha, no stress at all! What\'s up?',
              },
            ].map((ex) => (
              <div
                key={ex.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-3">
                  {ex.label}
                </span>
                <p className="text-sm text-gray-600 mb-3">&ldquo;{ex.msg}&rdquo;</p>
                <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-800 border border-gray-100">
                  {ex.reply}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  10. PRICING                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-50 py-20 md:py-28" id="pricing">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">Start free. Upgrade when you&apos;re ready.</h2>
          </div>

          <div className="grid sm:grid-cols-2 max-w-3xl mx-auto gap-8">
            {/* Free */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Free</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">$0</p>
              <p className="text-sm text-gray-400 mb-8">forever</p>
              <ul className="space-y-3 mb-8">
                {['5 Quick Replies per day', '1 Work Reply per day', '1 Fix My Message per day', 'Keyboard extension', 'Daily scenarios & streaks'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-teal-500 font-bold shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/reply"
                className="block text-center rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Try Free on the Web
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-teal-600 bg-white p-8 relative shadow-lg shadow-teal-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">MOST POPULAR</span>
              </div>
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-2">Pro</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">$7</p>
              <p className="text-sm text-gray-400 mb-8">per month &middot; $60/yr</p>
              <ul className="space-y-3 mb-8">
                {[
                  '25 Quick Replies per day',
                  '8 Work Replies per day',
                  '8 Fix My Message per day',
                  'AI conversation partner',
                  'Live Listen & voice practice',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-teal-500 font-bold shrink-0">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/reply"
                className="block text-center rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition"
              >
                Get Pro — $7/month
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  11. FINAL CTA                                               */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Reply faster. Sound natural.{' '}
            <span className="text-teal-400">Feel confident.</span>
          </h2>
          <p className="mt-5 text-lg text-gray-400 max-w-lg mx-auto">
            Join thousands of people who stopped overthinking their English messages.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <AppStoreButton className="bg-teal-600 hover:bg-teal-700" />
            <Link
              href="/reply"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-700 px-7 py-4 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition"
            >
              Try Free on the Web
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  FOOTER                                                      */}
      {/* ---------------------------------------------------------- */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-teal-500">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">&copy; {new Date().getFullYear()} KChime</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/privacy" className="hover:text-gray-600 transition">Privacy</a>
            <a href="/terms" className="hover:text-gray-600 transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
