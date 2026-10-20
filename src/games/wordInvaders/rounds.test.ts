import { describe, expect, it } from 'vitest';
import { ALL_WORDS, APPEARANCES_PER_WORD, OPTION_COUNT, buildOptions, buildOrder } from './rounds';

describe('Word Invaders rounds', () => {
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

  it('always offers the target once among distinct options', () => {
    for (const target of ALL_WORDS) {
      const options = buildOptions(target);
      expect(options).toHaveLength(OPTION_COUNT);
      expect(new Set(options).size).toBe(OPTION_COUNT);
      expect(options.filter((w) => w === target)).toHaveLength(1);
    }
  });
});
