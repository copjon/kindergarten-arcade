import type { GameMeta } from '../types/game';
import { LetterSoundsGame } from './letterSounds/LetterSoundsGame';
import { SoundBlasterGame } from './soundBlaster/SoundBlasterGame';
import { WordInvadersGame } from './wordInvaders/WordInvadersGame';

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
    id: 'sound-blaster',
    title: 'Sound Blaster',
    tagline: 'Sound out each letter, blend the word, blast the picture!',
    emoji: '🔊',
    color: '#00A8C7',
    Component: SoundBlasterGame,
  },
  {
    id: 'letter-sounds',
    title: 'Alpha Blast',
    tagline: 'Blast through the alphabet and master every letter sound',
    emoji: '🚀',
    color: '#FF2D6D',
    Component: LetterSoundsGame,
  },
];
