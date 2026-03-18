'use client';

import { useEffect, useRef, useState } from 'react';
import type { Reply } from '@/types';
import { getToneStyle } from '@/lib/tone-styles';

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
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    setDownloadError(false);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('toBlob returned null')); return; }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'kchime-reply.png';
          link.href = url;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve();
        }, 'image/png');
      });
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyImage() {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob returned null')), 'image/png');
      });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy image failed:', err);
      // Only fall back to text if clipboard image API is unsupported
      if (err instanceof Error && err.name === 'NotAllowedError') {
        alert('Clipboard image access denied. Try downloading instead.');
      } else {
        // Likely unsupported browser — fall back gracefully
        await navigator.clipboard.writeText(reply.text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  if (!open) return null;

  const color = getToneStyle(reply.tone).color;

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
            onClick={handleCopyImage}
            className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition"
          >
            {copied ? 'Copied!' : 'Copy Image'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {downloading ? 'Saving…' : downloadError ? 'Failed — try again' : 'Download PNG'}
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
