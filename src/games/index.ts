import type { GameMeta } from '../types/game';
import { LetterSoundsGame } from './letterSounds/LetterSoundsGame';

export const GAMES: GameMeta[] = [
  {
    id: 'letter-sounds',
    title: 'Letter Sounds',
    tagline: 'Meet the alphabet and learn every letter sound',
    emoji: '🔤',
    color: '#FF6B6B',
    Component: LetterSoundsGame,
  },
];
