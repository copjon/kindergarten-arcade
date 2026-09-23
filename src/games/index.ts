import type { GameMeta } from '../types/game';
import { LetterSoundsGame } from './letterSounds/LetterSoundsGame';

export const GAMES: GameMeta[] = [
  {
    id: 'letter-sounds',
    title: 'Alpha Blast',
    tagline: 'Blast through the alphabet and master every letter sound',
    emoji: '🚀',
    color: '#FF2D6D',
    Component: LetterSoundsGame,
  },
];
