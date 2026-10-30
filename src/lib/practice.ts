import type { SessionEntry } from './history';

const RECENT_SESSIONS = 10;
const AGE_DECAY = 0.8;
const MISS_WEIGHT = 3;
const SLOW_WEIGHT = 1;
const CLEAN_WEIGHT = -0.3;
const MIN_WEIGHT = 0.25;

/**
 * How much each item needs practice. Everything starts at 1; recent misses and
 * slow answers raise it, recent clean answers lower it (never below
 * MIN_WEIGHT, so mastered items still come back now and then), and older
 * sessions count less than newer ones.
 */
export function practiceWeights(items: string[], history: SessionEntry[], gameId: string): Map<string, number> {
  const weights = new Map(items.map((item) => [item, 1]));
  history
    .filter((e) => e.gameId === gameId)
    .slice(0, RECENT_SESSIONS)
    .forEach((entry, age) => {
      const factor = AGE_DECAY ** age;
      const missed = new Set(entry.missedLetters);
      const slow = new Set(entry.slowLetters);
      // Sessions saved before `items` existed always covered every item.
      const seen = new Set(entry.items ?? items);
      for (const item of items) {
        if (!seen.has(item)) continue;
        const change = missed.has(item) ? MISS_WEIGHT : slow.has(item) ? SLOW_WEIGHT : CLEAN_WEIGHT;
        weights.set(item, weights.get(item)! + change * factor);
      }
    });
  for (const [item, w] of weights) weights.set(item, Math.max(MIN_WEIGHT, w));
  return weights;
}

/** Weighted sample without replacement, in the order drawn. */
export function pickPracticeItems(weights: Map<string, number>, count: number, random = Math.random): string[] {
  const pool = [...weights];
  const picked: string[] = [];
  while (picked.length < count && pool.length) {
    let roll = random() * pool.reduce((sum, [, w]) => sum + w, 0);
    let i = pool.findIndex(([, w]) => (roll -= w) < 0);
    if (i === -1) i = pool.length - 1; // floating-point leftovers land on the last item
    picked.push(pool[i][0]);
    pool.splice(i, 1);
  }
  return picked;
}
