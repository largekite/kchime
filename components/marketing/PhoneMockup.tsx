import { Sparkles, Wifi, Battery, Signal } from 'lucide-react';

export interface ReplyOption {
  text: string;
  confidence?: number;
}

export interface PhoneMockupProps {
  contactName: string;
  contactLabel?: string;
  incomingMessage: string;
  timestamp?: string;
  replies: ReplyOption[];
  highlightIndex?: number;
  variant?: 'light' | 'dark';
}

export default function PhoneMockup({
  contactName,
  contactLabel,
  incomingMessage,
  timestamp = '4:32 PM',
  replies,
  highlightIndex = 0,
  variant = 'light',
}: PhoneMockupProps) {
  const isDark = variant === 'dark';

  return (
    <div className="relative w-[290px] sm:w-[310px]">
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-b from-teal-400/10 to-transparent blur-2xl pointer-events-none" />

      {/* Phone frame */}
      <div
        className={`relative rounded-[2.8rem] border-[6px] p-2 shadow-2xl ${
          isDark
            ? 'border-gray-800 bg-gray-800'
            : 'border-gray-900 bg-gray-900'
        }`}
      >
        {/* Dynamic Island */}
        <div className="mx-auto mb-1.5 h-[26px] w-[100px] rounded-full bg-black flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-800 border border-gray-700" />
        </div>

        {/* Screen */}
        <div className="rounded-[2.2rem] bg-white overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-2 pb-1">
            <span className="text-[11px] font-semibold text-gray-900">9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3 text-gray-900" />
              <Wifi className="h-3 w-3 text-gray-900" />
              <Battery className="h-3.5 w-3.5 text-gray-900" />
            </div>
          </div>

          {/* Chat header */}
          <div className="border-b border-gray-100 px-5 py-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {contactName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{contactName}</p>
              {contactLabel && (
                <p className="text-[10px] text-gray-400">{contactLabel}</p>
              )}
            </div>
          </div>

          {/* Incoming message bubble */}
          <div className="px-4 pt-4 pb-2">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-gray-100 px-4 py-3">
              <p className="text-[13px] text-gray-800 leading-relaxed">
                {incomingMessage}
              </p>
            </div>
            <p className="mt-1 text-[10px] text-gray-400 ml-1">{timestamp}</p>
          </div>

          {/* KChime suggestion panel */}
          <div className="px-4 pt-3 pb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-500">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                  KChime
                </p>
              </div>
              <p className="text-[10px] text-gray-400">3 replies</p>
            </div>

            {/* Reply suggestions */}
            <div className="space-y-2">
              {replies.map((reply, i) => {
                const isHighlighted = i === highlightIndex;
                return (
                  <div
                    key={i}
                    className={`relative rounded-xl border px-4 py-3 transition ${
                      isHighlighted
                        ? 'border-teal-200 bg-gradient-to-r from-teal-50 to-white shadow-sm'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <p
                      className={`text-[13px] leading-relaxed ${
                        isHighlighted
                          ? 'text-teal-800 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      {reply.text}
                    </p>
                    {reply.confidence && isHighlighted && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="h-1 flex-1 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-400"
                            style={{ width: `${reply.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-teal-600">
                          {reply.confidence}%
                        </span>
                      </div>
                    )}
                    {isHighlighted && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
