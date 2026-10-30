import { LETTERS, randomPicture, soundsAlike, type LetterInfo, type LetterPicture } from '../../data/letters';
import type { SessionEntry } from '../../lib/history';
import { pickPracticeItems, practiceWeights } from '../../lib/practice';
import { shuffle } from '../../lib/random';

export type RoundMode = 'pickPicture' | 'pickLetter';

export interface RoundOption {
  letter: string;
  word?: string;
  emoji?: string;
}

export interface Round {
  mode: RoundMode;
  target: LetterInfo;
  picture: LetterPicture;
  options: RoundOption[];
}

export const GAME_ID = 'letter-sounds';
export const OPTION_COUNT = 4;
export const SESSION_LETTERS = 10;

// Letters taught by their ending sound can't be asked as "starts with".
export const QUIZ_LETTERS = LETTERS.filter((l) => l.soundAt !== 'end');

/** A short session, weighted toward letters recently missed or answered slowly. */
export function newSessionOrder(history: SessionEntry[] = []): string[] {
  const letters = QUIZ_LETTERS.map((l) => l.letter);
  return pickPracticeItems(practiceWeights(letters, history, GAME_ID), SESSION_LETTERS);
}

export function buildRound(letter: string, mode: RoundMode = Math.random() < 0.5 ? 'pickPicture' : 'pickLetter'): Round {
  const target = QUIZ_LETTERS.find((l) => l.letter === letter);
  if (!target) throw new Error(`Unknown letter: ${letter}`);
  const picture = randomPicture(target);
  // A distractor that starts with the same sound (cat vs. kite) would also be a right answer by ear.
  const distractorLetters = shuffle(QUIZ_LETTERS.filter((l) => l !== target && !soundsAlike(l, target))).slice(
    0,
    OPTION_COUNT - 1,
  );

  const options: RoundOption[] =
    mode === 'pickPicture'
      ? shuffle([{ letter: target.letter, ...picture }, ...distractorLetters.map((l) => ({ letter: l.letter, ...randomPicture(l) }))])
      : shuffle([{ letter: target.letter }, ...distractorLetters.map((l) => ({ letter: l.letter }))]);

  return { mode, target, picture, options };
}
