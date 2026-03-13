let currentAudio: HTMLAudioElement | null = null;

// In-memory LRU cache: text → ArrayBuffer so repeated plays are instant.
// Capped to prevent unbounded memory growth during long sessions.
const MAX_CACHE_ENTRIES = 50;
const audioCache = new Map<string, ArrayBuffer>();

function cacheSet(key: string, value: ArrayBuffer) {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    // Delete the oldest entry (first key in insertion order)
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) audioCache.delete(oldest);
  }
  audioCache.set(key, value);
}

export function cancelSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

function playBuffer(buffer: ArrayBuffer, onEnd: () => void) {
  const blob = new Blob([buffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;

  const cleanup = () => {
    URL.revokeObjectURL(url);
    currentAudio = null;
  };
  audio.onended = () => { cleanup(); onEnd(); };
  audio.onerror = () => { cleanup(); onEnd(); };

  audio.play().catch(() => { cleanup(); onEnd(); });
}

export async function speakText(text: string, onEnd: () => void, token?: string): Promise<void> {
  if (typeof window === 'undefined') {
    onEnd();
    return;
  }

  cancelSpeech();

  // Serve from cache if available
  const cached = audioCache.get(text);
  if (cached) {
    playBuffer(cached, onEnd);
    return;
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('TTS failed');

    const buffer = await res.arrayBuffer();
    cacheSet(text, buffer);
    playBuffer(buffer, onEnd);
  } catch {
    onEnd();
  }
}
