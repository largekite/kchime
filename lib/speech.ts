import type { Accent, AccentCode } from '@/types';

export const ACCENTS: Accent[] = [
  { code: 'en-US', label: 'American', flag: '🇺🇸' },
  { code: 'en-GB', label: 'British', flag: '🇬🇧' },
  { code: 'en-AU', label: 'Australian', flag: '🇦🇺' },
  { code: 'en-IN', label: 'Indian', flag: '🇮🇳' },
];

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback after 1s if event never fires
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}

export async function speakText(
  text: string,
  accentCode: AccentCode,
  onEnd: () => void
): Promise<void> {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.lang = accentCode;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  const voices = await getVoices();
  // Prefer exact match, then language prefix match
  const voice =
    voices.find((v) => v.lang === accentCode) ??
    voices.find((v) => v.lang.startsWith(accentCode.split('-')[0] + '-')) ??
    null;

  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}
