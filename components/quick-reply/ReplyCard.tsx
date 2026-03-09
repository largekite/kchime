'use client';

import { useState } from 'react';
import { ShareCardModal } from '@/components/shared/ShareCardModal';
import { speakText } from '@/lib/speech';
import type { Context, Reply, SavedPhrase, Tone } from '@/types';
import { Bookmark, BookmarkCheck, Check, Copy, Share2, Square, Volume2 } from 'lucide-react';
import clsx from 'clsx';

const TONE_STYLES: Record<Tone, { bg: string; badge: string; border: string }> = {
  Casual: { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
  Funny: { bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  Warm: { bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700', border: 'border-pink-200' },
  Safe: { bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
};

interface Props {
  reply: Reply;
  prompt: string;
  context: Context;
  onSave: (phrase: SavedPhrase) => void;
  saved?: boolean;
}

export function ReplyCard({ reply, prompt, context, onSave, saved = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);

  const styles = TONE_STYLES[reply.tone];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reply.text);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSpeak() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakText(reply.text, () => setSpeaking(false));
  }

  function handleSave() {
    if (isSaved) return;
    onSave({
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: reply.text,
      tone: reply.tone,
      context,
      prompt,
      savedAt: new Date().toISOString(),
    });
    setIsSaved(true);
  }

  return (
    <>
      <div className={clsx('rounded-xl border p-4 transition', styles.bg, styles.border)}>
        <div className="mb-2">
          <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold', styles.badge)}>
            {reply.tone}
          </span>
        </div>

        <p className="mb-4 text-base font-medium leading-snug text-gray-900">{reply.text}</p>

        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-white transition shadow-sm"
            title="Copy"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleSpeak}
            className={clsx(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition shadow-sm',
              speaking ? 'bg-indigo-600 text-white' : 'bg-white/70 text-gray-600 hover:bg-white'
            )}
            title="Speak"
          >
            {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {speaking ? 'Stop' : 'Speak'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={clsx(
              'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition shadow-sm',
              isSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-white/70 text-gray-600 hover:bg-white'
            )}
            title="Save"
          >
            {isSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="ml-auto flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-white transition shadow-sm"
            title="Share"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
        </div>
      </div>

      <ShareCardModal
        reply={reply}
        prompt={prompt}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
