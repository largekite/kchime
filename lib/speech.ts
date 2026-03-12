let currentAudio: HTMLAudioElement | null = null;

export function cancelSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

export async function speakText(text: string, onEnd: () => void, token?: string): Promise<void> {
  if (typeof window === 'undefined') {
    onEnd();
    return;
  }

  cancelSpeech();

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

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      onEnd();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      onEnd();
    };

    await audio.play();
  } catch {
    onEnd();
  }
}
