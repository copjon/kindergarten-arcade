import type { GameMeta } from '../types/game';
import { LetterSoundsGame } from './letterSounds/LetterSoundsGame';
import { WordInvadersGame } from './wordInvaders/WordInvadersGame';
import { MathBlastersGame } from './mathBlasters/MathBlastersGame';

export const GAMES: GameMeta[] = [
  {
    id: 'sight-words',
    title: 'Word Invaders',
    tagline: 'Blast the heart words before they land!',
    emoji: '👾',
    color: '#8B3CFF',
    Component: WordInvadersGame,
  },
  {
    id: 'letter-sounds',
    title: 'Alpha Blast',
    tagline: 'Blast through the alphabet and master every letter sound',
    emoji: '🚀',
    color: '#FF2D6D',
    Component: LetterSoundsGame,
  },
  {
    id: 'math-blasters',
    title: 'Math Blasters',
    tagline: 'Add and take away to blast the right answer!',
    emoji: '🛸',
    color: '#00C2A8',
    Component: MathBlastersGame,
  },
];
