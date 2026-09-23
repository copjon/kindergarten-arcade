export interface LetterPicture {
  word: string;
  emoji: string;
}

export interface LetterInfo {
  letter: string;
  sound: string;
  pictures: LetterPicture[];
}

// Picture words are chosen to avoid common synonyms that start with a
// different letter (e.g. a soccer ball ⚽ reads as "soccer" as easily as
// "ball", so B uses a baseball ⚾ instead — same letter either way).
export const LETTERS: LetterInfo[] = [
  {
    letter: 'a',
    sound: 'ah',
    pictures: [
      { word: 'apple', emoji: '🍎' },
      { word: 'ant', emoji: '🐜' },
      { word: 'axe', emoji: '🪓' },
      { word: 'anchor', emoji: '⚓' },
    ],
  },
  {
    letter: 'b',
    sound: 'buh',
    pictures: [
      { word: 'baseball', emoji: '⚾' },
      { word: 'banana', emoji: '🍌' },
      { word: 'bear', emoji: '🐻' },
      { word: 'bus', emoji: '🚌' },
    ],
  },
  {
    letter: 'c',
    sound: 'kuh',
    pictures: [
      { word: 'cat', emoji: '🐈' },
      { word: 'corn', emoji: '🌽' },
      { word: 'car', emoji: '🚗' },
      { word: 'cake', emoji: '🍰' },
    ],
  },
  {
    letter: 'd',
    sound: 'duh',
    pictures: [
      { word: 'dog', emoji: '🐕' },
      { word: 'duck', emoji: '🦆' },
      { word: 'drum', emoji: '🥁' },
      { word: 'door', emoji: '🚪' },
    ],
  },
  {
    letter: 'e',
    sound: 'eh',
    pictures: [
      { word: 'egg', emoji: '🥚' },
      { word: 'elephant', emoji: '🐘' },
      { word: 'ear', emoji: '👂' },
      { word: 'eight', emoji: '8️⃣' },
    ],
  },
  {
    letter: 'f',
    sound: 'fff',
    pictures: [
      { word: 'fish', emoji: '🐟' },
      { word: 'frog', emoji: '🐸' },
      { word: 'feather', emoji: '🪶' },
      { word: 'fan', emoji: '🪭' },
    ],
  },
  {
    letter: 'g',
    sound: 'guh',
    pictures: [
      { word: 'goat', emoji: '🐐' },
      { word: 'gorilla', emoji: '🦍' },
      { word: 'guitar', emoji: '🎸' },
      { word: 'grapes', emoji: '🍇' },
    ],
  },
  {
    letter: 'h',
    sound: 'huh',
    pictures: [
      { word: 'hat', emoji: '🎩' },
      { word: 'house', emoji: '🏠' },
      { word: 'hammer', emoji: '🔨' },
      { word: 'horse', emoji: '🐴' },
    ],
  },
  {
    letter: 'i',
    sound: 'ih',
    pictures: [
      { word: 'iguana', emoji: '🦎' },
      { word: 'ice cream', emoji: '🍦' },
    ],
  },
  {
    letter: 'j',
    sound: 'juh',
    pictures: [
      { word: 'juice', emoji: '🧃' },
      { word: 'joystick', emoji: '🕹️' },
    ],
  },
  {
    letter: 'k',
    sound: 'kuh',
    pictures: [
      { word: 'kite', emoji: '🪁' },
      { word: 'key', emoji: '🔑' },
      { word: 'kangaroo', emoji: '🦘' },
      { word: 'koala', emoji: '🐨' },
    ],
  },
  {
    letter: 'l',
    sound: 'lll',
    pictures: [
      { word: 'lion', emoji: '🦁' },
      { word: 'leaf', emoji: '🍃' },
      { word: 'leg', emoji: '🦵' },
      { word: 'lemon', emoji: '🍋' },
    ],
  },
  {
    letter: 'm',
    sound: 'mmm',
    pictures: [
      { word: 'mouse', emoji: '🐭' },
      { word: 'moon', emoji: '🌙' },
      { word: 'monkey', emoji: '🐵' },
      { word: 'map', emoji: '🗺️' },
    ],
  },
  {
    letter: 'n',
    sound: 'nnn',
    pictures: [
      { word: 'nose', emoji: '👃' },
      { word: 'notebook', emoji: '📓' },
      { word: 'nine', emoji: '9️⃣' },
      { word: 'nail', emoji: '💅' },
    ],
  },
  {
    letter: 'o',
    sound: 'aw',
    pictures: [
      { word: 'octopus', emoji: '🐙' },
      { word: 'orange', emoji: '🍊' },
      { word: 'owl', emoji: '🦉' },
      { word: 'onion', emoji: '🧅' },
    ],
  },
  {
    letter: 'p',
    sound: 'puh',
    pictures: [
      { word: 'pig', emoji: '🐷' },
      { word: 'pizza', emoji: '🍕' },
      { word: 'penguin', emoji: '🐧' },
      { word: 'panda', emoji: '🐼' },
    ],
  },
  {
    letter: 'q',
    sound: 'kwuh',
    pictures: [
      { word: 'question', emoji: '❓' },
      { word: 'quiet', emoji: '🤫' },
    ],
  },
  {
    letter: 'r',
    sound: 'rrr',
    pictures: [
      { word: 'rabbit', emoji: '🐇' },
      { word: 'rainbow', emoji: '🌈' },
      { word: 'robot', emoji: '🤖' },
      { word: 'rocket', emoji: '🚀' },
    ],
  },
  {
    letter: 's',
    sound: 'sss',
    pictures: [
      { word: 'sun', emoji: '☀️' },
      { word: 'snake', emoji: '🐍' },
      { word: 'star', emoji: '⭐' },
      { word: 'sock', emoji: '🧦' },
    ],
  },
  {
    letter: 't',
    sound: 'tuh',
    pictures: [
      { word: 'teeth', emoji: '🦷' },
      { word: 'tiger', emoji: '🐯' },
      { word: 'turtle', emoji: '🐢' },
      { word: 'train', emoji: '🚂' },
    ],
  },
  {
    letter: 'u',
    sound: 'uh',
    pictures: [
      { word: 'umbrella', emoji: '☂️' },
      { word: 'unicorn', emoji: '🦄' },
    ],
  },
  {
    letter: 'v',
    sound: 'vvv',
    pictures: [
      { word: 'vest', emoji: '🦺' },
      { word: 'volcano', emoji: '🌋' },
      { word: 'violin', emoji: '🎻' },
      { word: 'volleyball', emoji: '🏐' },
    ],
  },
  {
    letter: 'w',
    sound: 'wuh',
    pictures: [
      { word: 'watermelon', emoji: '🍉' },
      { word: 'whale', emoji: '🐳' },
      { word: 'worm', emoji: '🪱' },
      { word: 'window', emoji: '🪟' },
    ],
  },
  {
    letter: 'x',
    sound: 'ks',
    pictures: [{ word: 'x-ray', emoji: '🩻' }],
  },
  {
    letter: 'y',
    sound: 'yuh',
    pictures: [
      { word: 'yarn', emoji: '🧶' },
      { word: 'yo-yo', emoji: '🪀' },
      { word: 'yellow', emoji: '🟡' },
    ],
  },
  {
    letter: 'z',
    sound: 'zzz',
    pictures: [
      { word: 'zebra', emoji: '🦓' },
      { word: 'zero', emoji: '0️⃣' },
    ],
  },
];

export function randomPicture(letter: LetterInfo, avoid?: LetterPicture): LetterPicture {
  const pool = avoid && letter.pictures.length > 1 ? letter.pictures.filter((p) => p.word !== avoid.word) : letter.pictures;
  return pool[Math.floor(Math.random() * pool.length)];
}
