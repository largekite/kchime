'use client';

import { useEffect, useRef, useState } from 'react';
import type { Reply, Tone } from '@/types';

const TONE_COLORS: Record<Tone, string> = {
  Casual: '#6366f1',
  Funny: '#f59e0b',
  Warm: '#ec4899',
  Safe: '#10b981',
};

interface Props {
  reply: Reply;
  prompt: string;
  open: boolean;
  onClose: () => void;
}

export function ShareCardModal({ reply, prompt, open, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = 'kchime-reply.png';
      link.href = canvas.toDataURL('image/png');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyImage() {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // fallback: copy text
      await navigator.clipboard.writeText(reply.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!open) return null;

  const color = TONE_COLORS[reply.tone];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Preview card (what gets captured) */}
        <div
          ref={cardRef}
          style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
          className="p-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="font-bold text-gray-800">KChime</span>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {reply.tone}
            </span>
          </div>
          <p className="mb-2 text-xs text-gray-500 italic">&ldquo;{prompt}&rdquo;</p>
          <p className="text-lg font-medium leading-snug text-gray-900">{reply.text}</p>
          <p className="mt-4 text-xs text-gray-400">kchime.app</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {downloading ? 'Saving…' : 'Download PNG'}
          </button>
          <button
            onClick={handleCopyImage}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            {copied ? 'Copied!' : 'Copy Image'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
