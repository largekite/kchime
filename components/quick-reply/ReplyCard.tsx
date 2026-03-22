'use client';

import { useState } from 'react';
import { ShareCardModal } from '@/components/shared/ShareCardModal';
import { speakText, cancelSpeech } from '@/lib/speech';
import { useAuth } from '@/context/AuthContext';
import type { Context, Reply, SavedPhrase } from '@/types';
import { getToneStyle } from '@/lib/tone-styles';
import { Bookmark, BookmarkCheck, Check, Copy, Share2, Square, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  reply: Reply;
  prompt: string;
  context: Context;
  onSave: (phrase: SavedPhrase) => void;
  saved?: boolean;
}

export function ReplyCard({ reply, prompt, context, onSave, saved = false }: Props) {
  const { session } = useAuth();
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);

  const styles = getToneStyle(reply.tone);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text from a temporary textarea
      const ta = document.createElement('textarea');
      ta.value = reply.text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleSpeak() {
    if (speaking) {
      cancelSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    setTtsError('');
    speakText(
      reply.text,
      () => setSpeaking(false),
      session?.access_token,
      (code) => {
        setSpeaking(false);
        if (code === 'limit_reached') setTtsError('Daily limit reached');
        else setTtsError('Audio unavailable');
        setTimeout(() => setTtsError(''), 3000);
      },
    );
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
      <div className={clsx('rounded-xl border p-4 transition lg:p-6 lg:rounded-2xl', styles.bg, styles.border)}>
        <div className="mb-2">
          <span className={clsx('rounded-full px-2 py-0.5 text-xs font-semibold lg:px-3 lg:py-1 lg:text-sm', styles.badge)}>
            {reply.tone}
          </span>
        </div>

        <p className="mb-4 text-base font-medium leading-snug text-gray-900 lg:text-lg lg:mb-5 lg:leading-relaxed">{reply.text}</p>

        <div className="flex gap-1.5 lg:gap-2">
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
              speaking ? 'bg-teal-600 text-white' : 'bg-white/70 text-gray-600 hover:bg-white'
            )}
            title="Speak"
          >
            {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {speaking ? 'Stop' : 'Speak'}
          </button>
          {ttsError && (
            <span className="text-xs text-red-500">{ttsError}</span>
          )}
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
