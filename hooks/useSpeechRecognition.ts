'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
  onSilence?: (transcript: string) => void;
  silenceMs?: number;
  continuous?: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition({
  onSilence,
  silenceMs = 2000,
  continuous = false,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef('');
  const stoppedRef = useRef(false);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  const resetSilenceTimer = useCallback(
    (currentTranscript: string) => {
      clearSilenceTimer();
      if (onSilence && currentTranscript.trim()) {
        silenceTimerRef.current = setTimeout(() => {
          onSilence(currentTranscript);
          setTranscript('');
          transcriptRef.current = '';
        }, silenceMs);
      }
    },
    [onSilence, silenceMs]
  );

  const stop = useCallback(() => {
    clearSilenceTimer();
    stoppedRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    // Stop any existing recognition instance to prevent zombie listeners
    // that would pile up after repeated start() calls (e.g. after each AI response).
    if (recognitionRef.current) {
      try { recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }

    // Reset transcript state for a fresh listening session
    transcriptRef.current = '';
    setTranscript('');
    clearSilenceTimer();

    stoppedRef.current = false;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      const combined = (transcriptRef.current + final + interim).trim();
      setTranscript(combined);
      transcriptRef.current = transcriptRef.current + final;
      resetSilenceTimer(combined);
    };

    recognition.onend = () => {
      // Only auto-restart if this is still the active recognition instance
      if (continuous && !stoppedRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
          // Don't toggle isListening off+on — that causes the mic button to flash
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [continuous, resetSilenceTimer]);

  const reset = useCallback(() => {
    setTranscript('');
    transcriptRef.current = '';
    clearSilenceTimer();
  }, []);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      stoppedRef.current = true;
      recognitionRef.current?.stop();
    };
  }, []);

  return { transcript, isListening, isSupported, start, stop, reset };
}
