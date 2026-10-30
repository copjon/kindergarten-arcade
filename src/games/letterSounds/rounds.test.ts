import { describe, expect, it } from 'vitest';
import { LETTERS, soundsAlike } from '../../data/letters';
import { OPTION_COUNT, QUIZ_LETTERS, buildRound, newSessionOrder } from './rounds';

describe('Alpha Blast rounds', () => {
  it('runs through every quizzable letter exactly once per session', () => {
    expect([...newSessionOrder()].sort()).toEqual(QUIZ_LETTERS.map((l) => l.letter));
  });

  it('leaves out x, whose pictures start with its name rather than its sound', () => {
    expect(newSessionOrder()).not.toContain('x');
    expect(QUIZ_LETTERS).toHaveLength(LETTERS.length - 1);
  });

  it('never offers a distractor that starts with the same sound as the target', () => {
    for (const target of QUIZ_LETTERS) {
      for (let run = 0; run < 20; run++) {
        for (const o of buildRound(target.letter).options) {
          if (o.letter === target.letter) continue;
          const other = LETTERS.find((l) => l.letter === o.letter)!;
          expect(soundsAlike(other, target), `${o.letter} offered for ${target.letter}`).toBe(false);
          expect(other.quizzable, o.letter).not.toBe(false);
        }
      }
    }
  });

  it.each(['pickPicture', 'pickLetter'] as const)('%s rounds have one correct answer among distinct options', (mode) => {
    for (const { letter } of QUIZ_LETTERS) {
      const round = buildRound(letter, mode);
      expect(round.mode).toBe(mode);
      expect(round.options).toHaveLength(OPTION_COUNT);
      expect(new Set(round.options.map((o) => o.letter)).size).toBe(OPTION_COUNT);
      expect(round.options.filter((o) => o.letter === letter)).toHaveLength(1);
    }
  });

  it('pickPicture options carry pictures and the target shows its own picture', () => {
    const round = buildRound('m', 'pickPicture');
    for (const o of round.options) {
      expect(o.emoji).toBeTruthy();
      expect(o.word?.[0]).toBe(o.letter);
    }
    const correct = round.options.find((o) => o.letter === 'm')!;
    expect(correct.word).toBe(round.picture.word);
  });

  it('pickLetter options are letters only, and the prompt picture matches the target', () => {
    const round = buildRound('t', 'pickLetter');
    for (const o of round.options) expect(o.emoji).toBeUndefined();
    expect(round.picture.word[0]).toBe('t');
  });

  it('rejects unknown letters', () => {
    expect(() => buildRound('?')).toThrow();
  });
});
