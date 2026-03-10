'use client';

import { ContactSelector } from '@/components/shared/ContactSelector';
import { fixMessage, LimitReachedError, type MessageFix } from '@/lib/claude';
import { useContacts } from '@/hooks/useContacts';
import { getToneProfile } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { UpgradePrompt } from '@/components/shared/UpgradePrompt';
import clsx from 'clsx';
import { useState } from 'react';
import { Check, Copy, Wand2 } from 'lucide-react';

const MESSAGE_TYPES = ['Casual text', 'Work email', 'Slack / Teams', 'Formal letter', 'Social media'];
const RELATIONSHIPS = ['to my manager', 'to a coworker', 'to a client', 'to a friend', 'to my landlord', 'general'];

const TONE_STYLES: Record<string, { bg: string; badge: string; dot: string }> = {
  // Work email
  Polished:      { bg: 'bg-indigo-50 border-indigo-100',  badge: 'bg-indigo-100 text-indigo-700',    dot: 'bg-indigo-500' },
  Approachable:  { bg: 'bg-pink-50 border-pink-100',      badge: 'bg-pink-100 text-pink-700',        dot: 'bg-pink-500' },
  Confident:     { bg: 'bg-emerald-50 border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  // Casual text
  Clean:         { bg: 'bg-sky-50 border-sky-100',         badge: 'bg-sky-100 text-sky-700',          dot: 'bg-sky-500' },
  Friendly:      { bg: 'bg-pink-50 border-pink-100',       badge: 'bg-pink-100 text-pink-700',        dot: 'bg-pink-500' },
  Punchy:        { bg: 'bg-orange-50 border-orange-100',   badge: 'bg-orange-100 text-orange-700',    dot: 'bg-orange-500' },
  // Slack / Teams
  Direct:        { bg: 'bg-emerald-50 border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  // Formal letter
  Diplomatic:    { bg: 'bg-violet-50 border-violet-100',   badge: 'bg-violet-100 text-violet-700',    dot: 'bg-violet-500' },
  Authoritative: { bg: 'bg-slate-50 border-slate-100',     badge: 'bg-slate-100 text-slate-700',      dot: 'bg-slate-500' },
  // Social media
  Smooth:        { bg: 'bg-cyan-50 border-cyan-100',       badge: 'bg-cyan-100 text-cyan-700',        dot: 'bg-cyan-500' },
  Bold:          { bg: 'bg-red-50 border-red-100',          badge: 'bg-red-100 text-red-700',          dot: 'bg-red-500' },
  Witty:         { bg: 'bg-amber-50 border-amber-100',     badge: 'bg-amber-100 text-amber-700',      dot: 'bg-amber-500' },
};

const FREE_LIMIT = 3;

export default function FixTab() {
  const { plan } = useAuth();
  const { contacts, relationships, selectedContactId, setSelectedContactId, getContactPersonalization } = useContacts();
  const [draft, setDraft] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES[0]);
  const [relationship, setRelationship] = useState(RELATIONSHIPS[5]);
  const [fixes, setFixes] = useState<MessageFix[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usageCount, setUsageCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('fix_usage');
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored) as { date: string; count: number };
    if (date !== new Date().toISOString().split('T')[0]) return 0;
    return count;
  });

  function bumpUsage() {
    const today = new Date().toISOString().split('T')[0];
    const next = usageCount + 1;
    setUsageCount(next);
    localStorage.setItem('fix_usage', JSON.stringify({ date: today, count: next }));
  }

  async function handleFix() {
    if (!draft.trim()) return;
    if (plan !== 'pro' && usageCount >= FREE_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    setError('');
    setFixes([]);
    try {
      const tp = getToneProfile();
      const result = await fixMessage(draft.trim(), messageType, relationship, {
        toneProfile: {
          formality: tp.formality,
          lengthPreference: tp.lengthPreference,
          emojiEnabled: tp.emojiEnabled,
          customInstructions: tp.customInstructions,
        },
        ...getContactPersonalization(),
      });
      setFixes(result);
      if (plan !== 'pro') bumpUsage();
    } catch (e) {
      if (e instanceof LimitReachedError) {
        setShowUpgrade(true);
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1800);
    } catch {
      // clipboard API may fail if page is not focused
    }
  }

  const remaining = FREE_LIMIT - usageCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fix My Message</h1>
        <p className="text-sm text-gray-500 mt-0.5">Paste a draft — get 3 polished rewrites that sound natural in American English.</p>
      </div>

      {/* Input card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 space-y-4">
        {/* Selectors */}
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-500">Message type</label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {MESSAGE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-gray-500">This is</label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Contact picker */}
        <ContactSelector
          contacts={contacts}
          relationships={relationships}
          selectedContactId={selectedContactId}
          onSelect={setSelectedContactId}
        />

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste or type your draft message here…&#10;&#10;e.g. &quot;hey can u send the report when u get a chance thx&quot;"
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <span className="absolute bottom-3 right-3 text-xs text-gray-300">{draft.length}</span>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between">
          {plan !== 'pro' && (
            <span className="text-xs text-gray-400">
              {remaining > 0 ? `${remaining} fix${remaining === 1 ? '' : 'es'} left today` : 'Daily limit reached'}
            </span>
          )}
          <button
            onClick={handleFix}
            disabled={loading || !draft.trim()}
            className={clsx(
              'ml-auto flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition',
              loading || !draft.trim()
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            )}
          >
            <Wand2 className="h-4 w-4" />
            {loading ? 'Fixing…' : 'Fix it'}
          </button>
        </div>
      </div>

      {/* Results */}
      {fixes.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">3 Rewrites</p>
          {fixes.map((fix, i) => {
            const style = TONE_STYLES[fix.tone] ?? TONE_STYLES.Polished;
            const copyId = `fix-${i}`;
            return (
              <div key={i} className={clsx('rounded-2xl border p-5 space-y-3', style.bg)}>
                <div className="flex items-center justify-between">
                  <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold', style.badge)}>
                    {fix.tone}
                  </span>
                  <button
                    onClick={() => handleCopy(fix.text, copyId)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-gray-500 hover:bg-white/60 transition"
                  >
                    {copiedId === copyId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedId === copyId ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <p className="text-sm text-gray-900 leading-relaxed">{fix.text}</p>

                {fix.improvements.length > 0 && (
                  <ul className="space-y-1">
                    {fix.improvements.map((imp, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-gray-500">
                        <span className={clsx('mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0', style.dot)} />
                        {imp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showUpgrade && (
        <UpgradePrompt
          reason="Upgrade to Pro for unlimited message fixes."
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </div>
  );
}
