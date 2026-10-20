import { describe, expect, it } from 'vitest';
import {
  ALL_WORDS,
  OPTION_COUNT,
  WORDS_PER_SESSION,
  buildOptions,
  buildSession,
  sharedPositions,
  soundsFor,
} from './rounds';

describe('Sound Blaster rounds', () => {
  it('uses each letter’s sound, in order', () => {
    expect(soundsFor('cat')).toEqual(['kuh', 'ah', 'tuh']);
  });

  it('counts letters shared in the same position', () => {
    expect(sharedPositions('cat', 'hat')).toBe(2);
    expect(sharedPositions('cat', 'cup')).toBe(1);
    expect(sharedPositions('cat', 'dog')).toBe(0);
  });

  it('builds sessions of different words', () => {
    for (let run = 0; run < 25; run++) {
      const session = buildSession();
      expect(session).toHaveLength(WORDS_PER_SESSION);
      expect(new Set(session).size).toBe(WORDS_PER_SESSION);
    }
  });

  it('offers the target once among distinct options', () => {
    for (const target of ALL_WORDS) {
      const options = buildOptions(target);
      expect(options).toHaveLength(OPTION_COUNT);
      expect(new Set(options).size).toBe(OPTION_COUNT);
      expect(options.filter((w) => w === target)).toHaveLength(1);
    }
  });

  it('always includes a look-alike word, so guessing from the first letter is not enough', () => {
    for (let run = 0; run < 10; run++) {
      for (const target of ALL_WORDS) {
        const others = buildOptions(target).filter((w) => w !== target);
        expect(others.some((w) => sharedPositions(w, target) > 0), target).toBe(true);
      }
    }
  });
});
