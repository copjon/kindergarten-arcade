import { describe, expect, it } from 'vitest';
import { LETTERS, randomPicture, soundsAlike } from './letters';

const allPictures = LETTERS.flatMap((l) => l.pictures.map((p) => ({ ...p, letter: l.letter })));

describe('letter data', () => {
  it('covers the alphabet a–z in order', () => {
    expect(LETTERS.map((l) => l.letter).join('')).toBe('abcdefghijklmnopqrstuvwxyz');
  });

  it('gives every letter a sound and at least one picture', () => {
    for (const l of LETTERS) {
      expect(l.sound, l.letter).not.toBe('');
      expect(l.pictures.length, l.letter).toBeGreaterThan(0);
    }
  });

  it('only uses picture words that start with their letter', () => {
    for (const p of allPictures) {
      expect(p.word[0], `${p.word} under "${p.letter}"`).toBe(p.letter);
    }
  });

  // A picture shared between letters would make a question ambiguous.
  it('never reuses the same emoji or word for two different pictures', () => {
    const emoji = allPictures.map((p) => p.emoji);
    const words = allPictures.map((p) => p.word);
    expect(new Set(emoji).size).toBe(emoji.length);
    expect(new Set(words).size).toBe(words.length);
  });
});

describe('soundsAlike', () => {
  const byLetter = (c: string) => LETTERS.find((l) => l.letter === c)!;

  it('groups the letters that open with a /k/ sound', () => {
    for (const [a, b] of [['c', 'k'], ['c', 'q'], ['k', 'x']]) expect(soundsAlike(byLetter(a), byLetter(b))).toBe(true);
  });

  it('keeps clearly different sounds apart', () => {
    for (const [a, b] of [['b', 'd'], ['m', 'n'], ['e', 'i']]) expect(soundsAlike(byLetter(a), byLetter(b))).toBe(false);
  });
});

describe('randomPicture', () => {
  it('avoids repeating the current picture when the letter has others', () => {
    const a = LETTERS.find((l) => l.letter === 'a')!;
    for (let i = 0; i < 50; i++) {
      expect(randomPicture(a, a.pictures[0]).word).not.toBe(a.pictures[0].word);
    }
  });

  it('still returns the only picture when there is just one', () => {
    const x = LETTERS.find((l) => l.letter === 'x')!;
    expect(randomPicture(x, x.pictures[0])).toEqual(x.pictures[0]);
  });
});
