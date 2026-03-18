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
  Mic,
  Send,
  CheckCircle2,
  ArrowRight,
  Star,
  Briefcase,
  GraduationCap,
  Clock,
  Heart,
} from 'lucide-react';

export const metadata = {
  title: 'KChime — AI Reply Assistant for Texts, Emails & Chats',
  description:
    'Never wonder how to reply again. KChime suggests the perfect response for texts, emails, and chats — instantly.',
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
      {/* Apple logo */}
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
      {/* incoming bubble */}
      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 mb-3">
        <p className="text-[11px] font-medium text-gray-400 mb-1">Incoming</p>
        &ldquo;{incoming}&rdquo;
      </div>
      {/* reply bubble */}
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
              Open App
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
          {/* Left copy */}
          <div>
            <Badge>AI Reply Assistant</Badge>
            <h1 className="mt-6 text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.1]">
              Never wonder how to reply{' '}
              <span className="text-teal-600">again.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
              KChime suggests the perfect response for texts, emails, and chats — instantly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <AppStoreButton />
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-7 py-4 text-sm font-semibold text-gray-700 hover:border-teal-200 hover:text-teal-700 transition"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Demo
              </a>
            </div>
          </div>

          {/* Right — iPhone mockup */}
          <div className="flex justify-center">
            <div className="relative w-[280px] sm:w-[300px]">
              {/* Phone frame */}
              <div className="rounded-[2.5rem] border-[6px] border-gray-900 bg-gray-900 p-2 shadow-2xl">
                {/* Notch */}
                <div className="mx-auto mb-2 h-6 w-28 rounded-full bg-gray-900" />
                {/* Screen */}
                <div className="rounded-[2rem] bg-white overflow-hidden">
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-2 text-[10px] font-semibold text-gray-500">
                    <span>9:41</span>
                    <div className="flex gap-1 items-center">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <div className="h-2 w-4 rounded-sm bg-gray-400" />
                    </div>
                  </div>

                  {/* Chat header */}
                  <div className="border-b border-gray-100 px-5 pb-3">
                    <p className="text-xs text-gray-400">Messages</p>
                    <p className="text-sm font-semibold text-gray-900">Sarah — Manager</p>
                  </div>

                  {/* Incoming message */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3 text-sm text-gray-800">
                      Can you send the report tonight?
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400 ml-1">4:32 PM</p>
                  </div>

                  {/* KChime reply suggestions */}
                  <div className="px-4 pt-2 pb-5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                      <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wide">KChime Replies</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        'Sure — I\'ll send it tonight.',
                        'Working on it now.',
                        'I\'ll send it shortly.',
                      ].map((reply, i) => (
                        <button
                          key={i}
                          className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                            i === 0
                              ? 'border-teal-200 bg-teal-50 text-teal-800 font-medium'
                              : 'border-gray-100 bg-white text-gray-700 hover:border-teal-100'
                          }`}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  2. PROBLEM / BENEFIT STRIP                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-950 text-white py-14">
        <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: <Zap className="h-6 w-6" />, label: 'Reply instantly' },
            { icon: <Briefcase className="h-6 w-6" />, label: 'Sound professional' },
            { icon: <Heart className="h-6 w-6" />, label: 'Fix awkward messages' },
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
      {/*  3. USE CASE SECTION                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Use cases</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">One tap. Perfect reply.</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              KChime handles the messages you dread — so you don&apos;t have to.
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
      {/*  4. HOW IT WORKS                                             */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-50 py-20 md:py-28">
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
                desc: 'Drop in a screenshot, paste the text, or use voice input — KChime understands it all.',
              },
              {
                step: '2',
                icon: <Sparkles className="h-6 w-6" />,
                title: 'Get 3 smart replies',
                desc: 'AI generates three polished responses matched to tone, context, and relationship.',
              },
              {
                step: '3',
                icon: <Send className="h-6 w-6" />,
                title: 'Tap and send',
                desc: 'Pick the reply you like, copy it, and send — all in under 5 seconds.',
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
      {/*  5. FEATURES                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold">Built to make replying effortless</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant AI replies"
              description="Get three polished responses in under a second — no typing, no thinking, no stress."
            />
            <FeatureCard
              icon={<MessageCircle className="h-6 w-6" />}
              title="Relationship-aware tone"
              description="KChime adjusts tone based on who you're talking to — your boss, your friend, or your kid's teacher."
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="Keyboard that works anywhere"
              description="Use KChime inside iMessage, WhatsApp, Slack, email — any app with a keyboard."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Confidence score"
              description="Each reply shows how well it fits the conversation so you always pick the right one."
            />
            <FeatureCard
              icon={<Star className="h-6 w-6" />}
              title="Reply packs"
              description="Pre-built response sets for common scenarios — meetings, apologies, follow-ups, and more."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Private by default"
              description="Your messages are never stored. Everything is processed securely and forgotten immediately."
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  6. PRIVACY / TRUST                                          */}
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

            {/* Trust visual */}
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
      {/*  7. SOCIAL PROOF / EXAMPLES                                  */}
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
      {/*  8. FINAL CTA                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Reply faster. Sound better.{' '}
            <span className="text-teal-400">Stress less.</span>
          </h2>
          <p className="mt-5 text-lg text-gray-400 max-w-lg mx-auto">
            Join thousands of people who stopped overthinking their messages.
          </p>
          <div className="mt-10 flex justify-center">
            <AppStoreButton className="bg-teal-600 hover:bg-teal-700" />
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Free to try. No credit card required.
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
