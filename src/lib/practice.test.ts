import { describe, expect, it } from 'vitest';
import type { SessionEntry } from './history';
import { pickPracticeItems, practiceWeights } from './practice';

const ITEMS = ['a', 'b', 'c', 'd'];

function entry(partial: Partial<SessionEntry>): SessionEntry {
  return {
    id: 'x',
    gameId: 'letter-sounds',
    gameTitle: 'Alpha Blast',
    timestamp: 0,
    score: 0,
    maxScore: 0,
    total: 0,
    gotFirstTry: 0,
    avgTimeMs: 0,
    missedLetters: [],
    slowLetters: [],
    ...partial,
  };
}

describe('practiceWeights', () => {
  it('weighs everything equally with no history', () => {
    expect([...practiceWeights(ITEMS, [], 'letter-sounds').values()]).toEqual([1, 1, 1, 1]);
  });

  it('ranks missed above slow above unseen above clean', () => {
    const w = practiceWeights(ITEMS, [entry({ items: ['a', 'b', 'c'], missedLetters: ['a'], slowLetters: ['b'] })], 'letter-sounds');
    expect(w.get('a')!).toBeGreaterThan(w.get('b')!);
    expect(w.get('b')!).toBeGreaterThan(w.get('d')!);
    expect(w.get('d')!).toBeGreaterThan(w.get('c')!);
  });

  it('counts recent sessions more than old ones', () => {
    const history = [entry({ missedLetters: ['a'] }), entry({ missedLetters: ['b'] })]; // newest first
    const w = practiceWeights(ITEMS, history, 'letter-sounds');
    expect(w.get('a')!).toBeGreaterThan(w.get('b')!);
  });

  it('never drops a mastered item to zero', () => {
    const history = Array.from({ length: 10 }, () => entry({ items: ITEMS }));
    expect(practiceWeights(ITEMS, history, 'letter-sounds').get('a')).toBeGreaterThan(0);
  });

  it('ignores other games', () => {
    const w = practiceWeights(ITEMS, [entry({ gameId: 'sight-words', missedLetters: ['a'] })], 'letter-sounds');
    expect(w.get('a')).toBe(1);
  });

  it('treats legacy sessions without items as having covered everything', () => {
    const w = practiceWeights(ITEMS, [entry({ missedLetters: ['a'] })], 'letter-sounds');
    expect(w.get('b')!).toBeLessThan(1);
  });
});

describe('pickPracticeItems', () => {
  it('returns the requested number of distinct items', () => {
    const picked = pickPracticeItems(practiceWeights(ITEMS, [], 'letter-sounds'), 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
  });

  it('caps at the number of items available', () => {
    expect(pickPracticeItems(practiceWeights(ITEMS, [], 'letter-sounds'), 10)).toHaveLength(4);
  });

  it('draws heavier items far more often', () => {
    const weights = new Map([
      ['weak', 4],
      ['solid', 0.25],
    ]);
    let weakFirst = 0;
    for (let i = 0; i < 500; i++) if (pickPracticeItems(weights, 1)[0] === 'weak') weakFirst++;
    expect(weakFirst).toBeGreaterThan(400);
  });
});
