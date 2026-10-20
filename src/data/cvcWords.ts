export interface CvcWord {
  word: string;
  emoji: string;
}

// Short-vowel consonant-vowel-consonant words: every letter makes its usual
// sound, so they can be sounded out and blended. Pictures are chosen to avoid
// common synonyms (a 🐖 is a "pig", not a "hog"). No words with "l": in most
// fonts a lowercase l looks just like a capital I.
export const CVC_WORDS: CvcWord[] = [
  { word: 'cat', emoji: '🐈' },
  { word: 'hat', emoji: '🎩' },
  { word: 'bat', emoji: '🦇' },
  { word: 'rat', emoji: '🐀' },
  { word: 'map', emoji: '🗺️' },
  { word: 'van', emoji: '🚐' },
  { word: 'bed', emoji: '🛏️' },
  { word: 'pen', emoji: '🖊️' },
  { word: 'web', emoji: '🕸️' },
  { word: 'ten', emoji: '🔟' },
  { word: 'hen', emoji: '🐔' },
  { word: 'pig', emoji: '🐖' },
  { word: 'pin', emoji: '📌' },
  { word: 'six', emoji: '6️⃣' },
  { word: 'dog', emoji: '🐕' },
  { word: 'box', emoji: '📦' },
  { word: 'fox', emoji: '🦊' },
  { word: 'sun', emoji: '☀️' },
  { word: 'bus', emoji: '🚌' },
  { word: 'cup', emoji: '🥤' },
  { word: 'bug', emoji: '🐛' },
];
