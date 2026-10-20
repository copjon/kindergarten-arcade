import { vi } from 'vitest';
import type { useSpeech } from '../hooks/useSpeech';

type Speech = ReturnType<typeof useSpeech>;

export function fakeSpeech() {
  const speak = vi.fn((_text: string, _opts?: unknown) => Promise.resolve());
  const speech = {
    speak,
    voices: [],
    voiceURI: null,
    selectVoice: vi.fn(),
    niceName: (v: SpeechSynthesisVoice) => v.name,
    voiceSupported: false,
  } as unknown as Speech;
  return { speech, speak };
}
