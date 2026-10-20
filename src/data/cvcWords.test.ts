import { describe, expect, it } from 'vitest';
import { CVC_WORDS } from './cvcWords';
import { LETTERS } from './letters';

const VOWELS = 'aeiou';

describe('CVC word data', () => {
  it('only has consonant-vowel-consonant words', () => {
    for (const { word } of CVC_WORDS) {
      expect(word, word).toMatch(/^[a-z]{3}$/);
      expect(VOWELS.includes(word[0]), word).toBe(false);
      expect(VOWELS.includes(word[1]), word).toBe(true);
      expect(VOWELS.includes(word[2]), word).toBe(false);
    }
  });

  it('has a known sound for every letter', () => {
    for (const { word } of CVC_WORDS) {
      for (const ch of word) expect(LETTERS.some((l) => l.letter === ch), `${word}: ${ch}`).toBe(true);
    }
  });

  it('never reuses a word or a picture', () => {
    expect(new Set(CVC_WORDS.map((w) => w.word)).size).toBe(CVC_WORDS.length);
    expect(new Set(CVC_WORDS.map((w) => w.emoji)).size).toBe(CVC_WORDS.length);
  });

  it('avoids "l", which beginners confuse with capital "I"', () => {
    for (const { word } of CVC_WORDS) expect(word, word).not.toContain('l');
  });

  it('covers every short vowel', () => {
    for (const v of VOWELS) expect(CVC_WORDS.some((w) => w.word[1] === v), v).toBe(true);
  });
});
