export type MathOp = '+' | '-';

export interface MathFact {
  /** Stable id stored in history, e.g. "3+4" or "7-2". */
  key: string;
  a: number;
  b: number;
  op: MathOp;
  answer: number;
}

/** Every number in a fact (both parts and the answer) stays within 0..MAX_NUMBER. */
export const MAX_NUMBER = 10;

export function makeFact(a: number, op: MathOp, b: number): MathFact {
  return { key: `${a}${op}${b}`, a, b, op, answer: op === '+' ? a + b : a - b };
}

function range(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i);
}

export const ADDITION_FACTS: MathFact[] = range(MAX_NUMBER).flatMap((a) =>
  range(MAX_NUMBER - a).map((b) => makeFact(a, '+', b)),
);

export const SUBTRACTION_FACTS: MathFact[] = range(MAX_NUMBER).flatMap((a) =>
  range(a).map((b) => makeFact(a, '-', b)),
);

export const ALL_FACTS: MathFact[] = [...ADDITION_FACTS, ...SUBTRACTION_FACTS];

export function parseFact(key: string): MathFact | null {
  const m = /^(\d+)([+-])(\d+)$/.exec(key);
  return m ? makeFact(Number(m[1]), m[2] as MathOp, Number(m[3])) : null;
}

/** How a fact is written on screen, with a real minus sign: "3 + 4", "7 − 2". */
export function writtenFact(fact: MathFact): string {
  return `${fact.a} ${fact.op === '+' ? '+' : '−'} ${fact.b}`;
}

/** How a fact is read aloud: "3 plus 4", "7 subtract 2". */
export function spokenFact(fact: MathFact): string {
  return `${fact.a} ${fact.op === '+' ? 'plus' : 'subtract'} ${fact.b}`;
}

/** Facts with a zero (or n − n) are easy wins; they still show up, just less often. */
export function isZeroFact(fact: MathFact): boolean {
  return fact.a === 0 || fact.b === 0 || fact.answer === 0;
}

const COUNTER_EMOJI = ['🍎', '⭐', '🐟', '🍪', '🎈', '🐞', '🍓', '🚀'];

/** A counting picture for a fact; the same fact always gets the same one. */
export function counterEmoji(fact: MathFact): string {
  return COUNTER_EMOJI[(fact.a * 7 + fact.b * 3 + (fact.op === '+' ? 0 : 1)) % COUNTER_EMOJI.length];
}
