export interface LetterPicture {
  word: string;
  emoji: string;
}

export interface LetterInfo {
  letter: string;
  sound: string;
  pictures: LetterPicture[];
  /** 'end' when words show the sound at the end (fox), because almost none start with it; such letters sit out Picture Match. */
  soundAt?: 'end';
}

// Picture words are chosen to avoid common synonyms that start with a
// different letter (e.g. a soccer ball ⚽ reads as "soccer" as easily as
// "ball", so B uses a baseball ⚾ instead — same letter either way).
//
// Every picture word must also *start with the letter's sound*, not just its
// spelling: vowels teach the short sound, so no ice cream for "ih" or eight
// for "eh".
export const LETTERS: LetterInfo[] = [
  {
    letter: 'a',
    sound: 'ah',
    pictures: [
      { word: 'apple', emoji: '🍎' },
      { word: 'ant', emoji: '🐜' },
      { word: 'avocado', emoji: '🥑' },
      { word: 'astronaut', emoji: '👨‍🚀' },
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
      { word: 'elf', emoji: '🧝' },
      { word: 'elevator', emoji: '🛗' },
    ],
  },
  {
    letter: 'f',
    sound: 'fff',
    pictures: [
      { word: 'fish', emoji: '🐟' },
      { word: 'frog', emoji: '🐸' },
      { word: 'flower', emoji: '🌸' },
      { word: 'fire', emoji: '🔥' },
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
      { word: 'inchworm', emoji: '🐛' },
    ],
  },
  {
    letter: 'j',
    sound: 'juh',
    pictures: [
      { word: 'juice', emoji: '🧃' },
      { word: 'jacket', emoji: '🧥' },
      { word: 'jar', emoji: '🫙' },
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
      { word: 'nurse', emoji: '👩‍⚕️' },
    ],
  },
  {
    letter: 'o',
    sound: 'aw',
    pictures: [
      { word: 'octopus', emoji: '🐙' },
      { word: 'otter', emoji: '🦦' },
      { word: 'olive', emoji: '🫒' },
      { word: 'ox', emoji: '🐂' },
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
      { word: 'upside down', emoji: '🙃' },
    ],
  },
  {
    letter: 'v',
    sound: 'vvv',
    pictures: [
      { word: 'vest', emoji: '🦺' },
      { word: 'volcano', emoji: '🌋' },
      { word: 'violin', emoji: '🎻' },
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
    // X-ray starts with the letter name "ex", not /ks/, so X is taught at the end of a word.
    pictures: [
      { word: 'fox', emoji: '🦊' },
      { word: 'box', emoji: '📦' },
      { word: 'six', emoji: '6️⃣' },
    ],
    soundAt: 'end',
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

/** Letters whose sounds open the same way (c/k/q/x all start with /k/; a "ah" and o "aw"), judged by the sound's first character. */
export function soundsAlike(a: LetterInfo, b: LetterInfo): boolean {
  return a.sound[0] === b.sound[0];
}

export function randomPicture(letter: LetterInfo, avoid?: LetterPicture): LetterPicture {
  const pool = avoid && letter.pictures.length > 1 ? letter.pictures.filter((p) => p.word !== avoid.word) : letter.pictures;
  return pool[Math.floor(Math.random() * pool.length)];
}
