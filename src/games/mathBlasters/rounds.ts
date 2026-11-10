import { ADDITION_FACTS, MAX_NUMBER, SUBTRACTION_FACTS, isZeroFact, type MathFact } from '../../data/mathFacts';
import type { SessionEntry } from '../../lib/history';
import { pickPracticeItems, practiceWeights } from '../../lib/practice';
import { shuffle } from '../../lib/random';

export const GAME_ID = 'math-blasters';
export const FACTS_PER_SESSION = 10;
export const OPTION_COUNT = 4;
/** Zero facts (3 + 0, 5 − 5, ...) are a third of all facts but teach little, so they come up less. */
export const ZERO_FACT_WEIGHT = 0.3;

export type OpChoice = 'add' | 'subtract' | 'mix';

function pick(facts: MathFact[], history: SessionEntry[], count: number): MathFact[] {
  const byKey = new Map(facts.map((f) => [f.key, f]));
  const weights = practiceWeights([...byKey.keys()], history, GAME_ID);
  for (const [key, w] of weights) if (isZeroFact(byKey.get(key)!)) weights.set(key, w * ZERO_FACT_WEIGHT);
  return pickPracticeItems(weights, count).map((key) => byKey.get(key)!);
}

/**
 * The session's facts, weighted toward ones recently missed or answered slowly.
 * A mixed session is split evenly between adding and taking away.
 */
export function pickSessionFacts(history: SessionEntry[] = [], ops: OpChoice = 'mix'): MathFact[] {
  if (ops === 'add') return pick(ADDITION_FACTS, history, FACTS_PER_SESSION);
  if (ops === 'subtract') return pick(SUBTRACTION_FACTS, history, FACTS_PER_SESSION);
  const adds = Math.ceil(FACTS_PER_SESSION / 2);
  return shuffle([
    ...pick(ADDITION_FACTS, history, adds),
    ...pick(SUBTRACTION_FACTS, history, FACTS_PER_SESSION - adds),
  ]);
}

const inRange = (n: number) => n >= 0 && n <= MAX_NUMBER;

/**
 * Wrong answers are the ones a child actually lands on: one off (a miscount),
 * the other operation's answer (adding instead of taking away), then two off.
 * Anything else in 0..10 fills in near the edges.
 */
export function buildOptions(fact: MathFact): number[] {
  const otherOp = fact.op === '+' ? Math.abs(fact.a - fact.b) : fact.a + fact.b;
  const tiers = [
    shuffle([fact.answer - 1, fact.answer + 1, otherOp]),
    shuffle([fact.answer - 2, fact.answer + 2]),
    shuffle(Array.from({ length: MAX_NUMBER + 1 }, (_, i) => i)),
  ];
  const distractors: number[] = [];
  for (const n of tiers.flat()) {
    if (distractors.length === OPTION_COUNT - 1) break;
    if (inRange(n) && n !== fact.answer && !distractors.includes(n)) distractors.push(n);
  }
  return shuffle([fact.answer, ...distractors]);
}
