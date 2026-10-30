import { describe, expect, it } from 'vitest';
import { ALL_WORDS, APPEARANCES_PER_WORD, OPTION_COUNT, WORDS_PER_SESSION, buildOptions, buildOrder, pickSessionWords } from './rounds';

describe('Word Invaders rounds', () => {
  it('picks a short set of distinct words for each session', () => {
    const words = pickSessionWords();
    expect(words).toHaveLength(WORDS_PER_SESSION);
    expect(new Set(words).size).toBe(WORDS_PER_SESSION);
  });

  it('repeats every word the same number of times per session', () => {
    for (let run = 0; run < 25; run++) {
      const order = buildOrder();
      expect(order).toHaveLength(ALL_WORDS.length * APPEARANCES_PER_WORD);
      for (const word of ALL_WORDS) {
        expect(order.filter((w) => w === word)).toHaveLength(APPEARANCES_PER_WORD);
      }
    }
  });

  it('never asks for the same word twice in a row', () => {
    for (let run = 0; run < 25; run++) {
      const order = buildOrder();
      order.forEach((w, i) => {
        if (i > 0) expect(w).not.toBe(order[i - 1]);
      });
    }
  });

  it('picks look-alike distractors so length alone does not give the answer away', () => {
    for (let run = 0; run < 25; run++) {
      expect(buildOptions('a').sort()).toEqual(['I', 'a', 'am', 'an'].sort());
      const forThe = buildOptions('the');
      expect(forThe).toContain('and');
      expect(forThe).toContain('to');
    }
  });

  it('always offers the target once among distinct options', () => {
    for (const target of ALL_WORDS) {
      const options = buildOptions(target);
      expect(options).toHaveLength(OPTION_COUNT);
      expect(new Set(options).size).toBe(OPTION_COUNT);
      expect(options.filter((w) => w === target)).toHaveLength(1);
    }
  });
});
