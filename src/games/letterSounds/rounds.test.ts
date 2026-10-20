import { describe, expect, it } from 'vitest';
import { LETTERS } from '../../data/letters';
import { OPTION_COUNT, buildRound, newSessionOrder } from './rounds';

describe('Alpha Blast rounds', () => {
  it('runs through every letter exactly once per session', () => {
    expect([...newSessionOrder()].sort()).toEqual(LETTERS.map((l) => l.letter));
  });

  it.each(['pickPicture', 'pickLetter'] as const)('%s rounds have one correct answer among distinct options', (mode) => {
    for (const { letter } of LETTERS) {
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
