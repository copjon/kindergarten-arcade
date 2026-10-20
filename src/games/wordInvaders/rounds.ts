import { SIGHT_WORDS } from '../../data/sightWords';
import { shuffle } from '../../lib/random';

export const APPEARANCES_PER_WORD = 2;
export const OPTION_COUNT = 4;
export const ALL_WORDS = SIGHT_WORDS.map((w) => w.word);

/** Every word appears APPEARANCES_PER_WORD times, never twice in a row. */
export function buildOrder(words: string[] = ALL_WORDS): string[] {
  const pool = words.flatMap((w) => Array<string>(APPEARANCES_PER_WORD).fill(w));
  for (let attempt = 0; attempt < 100; attempt++) {
    const order = shuffle(pool);
    if (order.every((w, i) => i === 0 || w !== order[i - 1])) return order;
  }
  return shuffle(pool);
}

export function buildOptions(target: string, words: string[] = ALL_WORDS): string[] {
  const others = shuffle(words.filter((w) => w !== target)).slice(0, OPTION_COUNT - 1);
  return shuffle([target, ...others]);
}
