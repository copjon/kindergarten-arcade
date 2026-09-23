import { useCallback, useEffect, useRef, useState } from 'react';

const VOICE_KEY = 'phonics.voice';

function scoreVoice(v: SpeechSynthesisVoice): number {
  const n = (v.name || '').toLowerCase();
  let s = 0;
  if (/en[-_]?us/i.test(v.lang)) s += 6;
  else if (/^en/i.test(v.lang)) s += 3;
  if (/natural|neural|online/.test(n)) s += 40;
  if (/google/.test(n)) s += 28;
  if (v.localService === false) s += 10;
  if (/\b(aria|jenny|ava|emma|michelle|sonia|libby|samantha|allison)\b/.test(n)) s += 12;
  if (/desktop|espeak|david|mark|hazel|zira/.test(n)) s -= 8;
  return s;
}

function niceName(v: SpeechSynthesisVoice): string {
  return (v.name || 'Voice')
    .replace(/^Microsoft\s+/, '')
    .replace(/^Google\s+/, 'Google · ')
    .replace(/\s*[-–]\s*English.*$/i, '')
    .replace(/\(Natural\)/i, '· natural')
    .trim();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
}

export function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const load = () => {
      const all = speechSynthesis.getVoices();
      if (!all.length) return;
      let en = all.filter((v) => /^en/i.test(v.lang)).sort((a, b) => scoreVoice(b) - scoreVoice(a));
      if (!en.length) en = all.slice();
      setVoices(en);

      let saved: string | null = null;
      try {
        saved = localStorage.getItem(VOICE_KEY);
      } catch {
        /* ignore */
      }
      const chosen = en.find((v) => v.voiceURI === saved) || en[0] || null;
      voiceRef.current = chosen;
      setVoiceURI(chosen?.voiceURI ?? null);
    };

    speechSynthesis.onvoiceschanged = load;
    load();
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const selectVoice = useCallback(
    (uri: string) => {
      const v = voices.find((x) => x.voiceURI === uri) ?? null;
      voiceRef.current = v;
      setVoiceURI(uri);
      try {
        localStorage.setItem(VOICE_KEY, uri);
      } catch {
        /* ignore */
      }
    },
    [voices],
  );

  const speak = useCallback((text: string, { rate = 0.9, pitch = 1.15 }: SpeakOptions = {}) => {
    return new Promise<void>((resolve) => {
      if (!('speechSynthesis' in window)) {
        setTimeout(resolve, 350);
        return;
      }
      try {
        speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      if (voiceRef.current) u.voice = voiceRef.current;
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };
      u.onend = finish;
      u.onerror = finish;
      speechSynthesis.speak(u);
      setTimeout(finish, Math.max(650, text.length * 150));
    });
  }, []);

  return { speak, voices, voiceURI, selectVoice, niceName, voiceSupported: 'speechSynthesis' in window };
}
