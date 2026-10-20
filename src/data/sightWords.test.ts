import { describe, expect, it } from 'vitest';
import { SIGHT_WORDS } from './sightWords';

describe('sight word data', () => {
  it('has no duplicate words', () => {
    const words = SIGHT_WORDS.map((w) => w.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it('uses each word, as a whole word, in its own example sentence', () => {
    for (const { word, sentence } of SIGHT_WORDS) {
      expect(sentence, word).toMatch(new RegExp(`\\b${word}\\b`, 'i'));
    }
  });

  it('gives every word an emoji', () => {
    for (const w of SIGHT_WORDS) expect(w.emoji, w.word).not.toBe('');
  });
});
