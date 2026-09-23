export const CHEERS = [
  'Yes! You got it! 🎉',
  'Awesome job! ⭐',
  'You’re a letter superstar! 🌟',
  'Nailed it! 🙌',
  'Super sounding! 🎈',
  'Woohoo! That’s right! 🥳',
  'Great ears! 👂✨',
  'You’re on fire! 🔥',
];

export const OOPS = [
  'Almost! Try again 👀',
  'So close! One more try 💪',
  'Not quite — give it another go!',
  'Ooh, tricky one! Try again 🤔',
  'Keep going, you’ve got this! 🌈',
];

export const PROMPTS = [
  'What sound is this?',
  'Listen carefully!',
  'Here comes a letter!',
  'Ready? Here we go!',
  'Sound it out with me!',
];

export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
