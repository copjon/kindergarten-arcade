import { describe, expect, it } from 'vitest';
import { rankVoices } from './useSpeech';

const voice = (name: string, lang = 'en-US', localService = true) =>
  ({ name, lang, localService, voiceURI: name, default: false }) as SpeechSynthesisVoice;

const names = (voices: SpeechSynthesisVoice[]) => voices.map((v) => v.name);

describe('voice ranking', () => {
  it('hides novelty, MacinTalk and Eloquence voices', () => {
    const ranked = rankVoices([
      voice('Samantha'),
      voice('Bubbles'),
      voice('Bad News'),
      voice('Zarvox'),
      voice('Fred'),
      voice('Grandma (English (US))'),
      voice('Rocko (English (US))'),
    ]);
    expect(names(ranked)).toEqual(['Samantha']);
  });

  it('keeps only English voices', () => {
    expect(names(rankVoices([voice('Amélie', 'fr-CA'), voice('Daniel', 'en-GB')]))).toEqual(['Daniel']);
  });

  it('puts natural and enhanced voices first', () => {
    const ranked = rankVoices([voice('Samantha'), voice('Ava (Enhanced)'), voice('Microsoft Aria Online (Natural)')]);
    expect(names(ranked).slice(0, 2)).toEqual(expect.arrayContaining(['Ava (Enhanced)', 'Microsoft Aria Online (Natural)']));
    expect(names(ranked)[2]).toBe('Samantha');
  });

  it('falls back to every voice rather than none', () => {
    expect(names(rankVoices([voice('Bubbles')]))).toEqual(['Bubbles']);
  });
});
