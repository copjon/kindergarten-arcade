import { LETTERS } from '../data/letters';
import { CVC_WORDS } from '../data/cvcWords';
import { SIGHT_WORDS } from '../data/sightWords';

export interface ItemDisplay {
  icon: string;
  label: string;
  tag: string;
}

export function describeLetter(letter: string): ItemDisplay {
  const info = LETTERS.find((l) => l.letter === letter);
  return { icon: info?.pictures[0].emoji ?? '', label: letter.toUpperCase() + letter, tag: letter.toUpperCase() };
}

export function describeWord(word: string): ItemDisplay {
  const info = SIGHT_WORDS.find((w) => w.word === word);
  return { icon: info?.emoji ?? '❤️', label: word, tag: word };
}

export function describeCvcWord(word: string): ItemDisplay {
  const info = CVC_WORDS.find((w) => w.word === word);
  return { icon: info?.emoji ?? '🔊', label: word, tag: word };
}

/** How each game's practice items (stored in history) are shown to parents. */
export const PRACTICE_KINDS: Record<string, { heading: string; describe: (item: string) => ItemDisplay }> = {
  'sight-words': { heading: 'Words to work on', describe: describeWord },
  'sound-blaster': { heading: 'Sounding-out words to work on', describe: describeCvcWord },
  'letter-sounds': { heading: 'Letters to work on', describe: describeLetter },
};

export function describeItem(gameId: string, item: string): ItemDisplay {
  return (PRACTICE_KINDS[gameId]?.describe ?? describeLetter)(item);
}
