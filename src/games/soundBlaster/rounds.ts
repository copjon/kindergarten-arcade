import { CVC_WORDS } from '../../data/cvcWords';
import { LETTERS } from '../../data/letters';
import { shuffle } from '../../lib/random';

export const WORDS_PER_SESSION = 10;
export const OPTION_COUNT = 3;
export const ALL_WORDS = CVC_WORDS.map((w) => w.word);

/** How many letters two words share in the same position ("cat"/"hat" share 2). */
export function sharedPositions(a: string, b: string): number {
  return [...a].filter((ch, i) => ch === b[i]).length;
}

/** The sound each letter makes, in order ("cat" → ["kuh", "ah", "tuh"]). */
export function soundsFor(word: string): string[] {
  return [...word].map((ch) => LETTERS.find((l) => l.letter === ch)!.sound);
}

/** A session's words: WORDS_PER_SESSION different words in random order. */
export function buildSession(words: string[] = ALL_WORDS): string[] {
  return shuffle(words).slice(0, WORDS_PER_SESSION);
}

/**
 * The target plus OPTION_COUNT - 1 other pictures. One of them always shares
 * letters with the target (cat vs hat), so the whole word has to be sounded
 * out rather than guessed from its first letter.
 */
export function buildOptions(target: string, words: string[] = ALL_WORDS): string[] {
  const others = shuffle(words.filter((w) => w !== target));
  const lookalike = [...others].sort((a, b) => sharedPositions(b, target) - sharedPositions(a, target))[0];
  const rest = others.filter((w) => w !== lookalike).slice(0, OPTION_COUNT - 2);
  return shuffle([target, lookalike, ...rest]);
}
