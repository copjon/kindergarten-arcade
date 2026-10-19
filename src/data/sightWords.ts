export interface SightWord {
  word: string;
  sentence: string;
  emoji: string;
}

// High-frequency "heart words": many can't be sounded out, so they're learned by heart.
export const SIGHT_WORDS: SightWord[] = [
  { word: 'I', sentence: 'I like to play.', emoji: '🙋' },
  { word: 'a', sentence: 'I see a cat.', emoji: '🐱' },
  { word: 'the', sentence: 'Pet the dog.', emoji: '🐶' },
  { word: 'and', sentence: 'Mom and me.', emoji: '👩‍👦' },
  { word: 'me', sentence: 'Look at me!', emoji: '👀' },
  { word: 'to', sentence: 'We go to the park.', emoji: '🌳' },
  { word: 'an', sentence: 'I ate an apple.', emoji: '🍎' },
  { word: 'is', sentence: 'The sun is hot.', emoji: '☀️' },
  { word: 'am', sentence: 'I am happy.', emoji: '😊' },
];
