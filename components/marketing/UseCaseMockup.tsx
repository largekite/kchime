'use client';

import { Sparkles } from 'lucide-react';

export interface UseCaseMockupProps {
  icon: React.ReactNode;
  title: string;
  tag: string;
  incomingMessage: string;
  sender: string;
  replies: string[];
  highlightIndex?: number;
  accentColor?: 'teal' | 'blue' | 'violet' | 'amber';
}

const accentMap = {
  teal: {
    tagBg: 'bg-teal-50',
    tagText: 'text-teal-700',
    replyBorder: 'border-teal-200',
    replyBg: 'bg-gradient-to-r from-teal-50 to-white',
    replyText: 'text-teal-800',
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-600',
    dot: 'bg-teal-400',
  },
  blue: {
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-700',
    replyBorder: 'border-blue-200',
    replyBg: 'bg-gradient-to-r from-blue-50 to-white',
    replyText: 'text-blue-800',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    dot: 'bg-blue-400',
  },
  violet: {
    tagBg: 'bg-violet-50',
    tagText: 'text-violet-700',
    replyBorder: 'border-violet-200',
    replyBg: 'bg-gradient-to-r from-violet-50 to-white',
    replyText: 'text-violet-800',
    iconBg: 'bg-violet-50',
    iconText: 'text-violet-600',
    dot: 'bg-violet-400',
  },
  amber: {
    tagBg: 'bg-amber-50',
    tagText: 'text-amber-700',
    replyBorder: 'border-amber-200',
    replyBg: 'bg-gradient-to-r from-amber-50 to-white',
    replyText: 'text-amber-800',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    dot: 'bg-amber-400',
  },
};

export default function UseCaseMockup({
  icon,
  title,
  tag,
  incomingMessage,
  sender,
  replies,
  highlightIndex = 0,
  accentColor = 'teal',
}: UseCaseMockupProps) {
  const a = accentMap[accentColor];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-[15px]">{title}</h3>
            <span className={`inline-block rounded-full ${a.tagBg} px-2 py-0.5 text-[10px] font-semibold ${a.tagText} uppercase tracking-wider mt-0.5`}>
              {tag}
            </span>
          </div>
        </div>
      </div>

      {/* Incoming message */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3.5 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
            {sender.charAt(0)}
          </div>
          <p className="text-[10px] font-medium text-gray-400">{sender}</p>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{incomingMessage}&rdquo;</p>
      </div>

      {/* KChime suggestions */}
      <div className="mb-1">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-teal-500" />
          <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
            KChime suggests
          </p>
        </div>

        <div className="space-y-2">
          {replies.map((reply, i) => {
            const isHighlighted = i === highlightIndex;
            return (
              <div
                key={i}
                className={`rounded-xl border px-4 py-2.5 flex items-start gap-2.5 transition ${
                  isHighlighted
                    ? `${a.replyBorder} ${a.replyBg}`
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isHighlighted ? a.dot : 'bg-gray-200'}`} />
                <p className={`text-sm leading-relaxed ${isHighlighted ? `${a.replyText} font-medium` : 'text-gray-500'}`}>
                  {reply}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
