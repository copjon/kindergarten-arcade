import { LETTERS, randomPicture, type LetterInfo, type LetterPicture } from '../../data/letters';
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

export const OPTION_COUNT = 4;

export function newSessionOrder(): string[] {
  return shuffle(LETTERS).map((l) => l.letter);
}

export function buildRound(letter: string, mode: RoundMode = Math.random() < 0.5 ? 'pickPicture' : 'pickLetter'): Round {
  const target = LETTERS.find((l) => l.letter === letter);
  if (!target) throw new Error(`Unknown letter: ${letter}`);
  const picture = randomPicture(target);
  const distractorLetters = shuffle(LETTERS.filter((l) => l.letter !== letter)).slice(0, OPTION_COUNT - 1);

  const options: RoundOption[] =
    mode === 'pickPicture'
      ? shuffle([{ letter: target.letter, ...picture }, ...distractorLetters.map((l) => ({ letter: l.letter, ...randomPicture(l) }))])
      : shuffle([{ letter: target.letter }, ...distractorLetters.map((l) => ({ letter: l.letter }))]);

  return { mode, target, picture, options };
}
