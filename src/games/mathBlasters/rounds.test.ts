import { describe, expect, it } from 'vitest';
import { ALL_FACTS, MAX_NUMBER, isZeroFact, parseFact } from '../../data/mathFacts';
import type { SessionEntry } from '../../lib/history';
import { FACTS_PER_SESSION, GAME_ID, OPTION_COUNT, buildOptions, pickSessionFacts } from './rounds';

describe('Math Blasters rounds', () => {
  it('picks a short set of distinct facts for each session', () => {
    const facts = pickSessionFacts();
    expect(facts).toHaveLength(FACTS_PER_SESSION);
    expect(new Set(facts.map((f) => f.key)).size).toBe(FACTS_PER_SESSION);
  });

  it('sticks to the chosen operation', () => {
    expect(pickSessionFacts([], 'add').every((f) => f.op === '+')).toBe(true);
    expect(pickSessionFacts([], 'subtract').every((f) => f.op === '-')).toBe(true);
  });

  it('splits a mixed session evenly between adding and taking away', () => {
    for (let run = 0; run < 25; run++) {
      const facts = pickSessionFacts([], 'mix');
      expect(facts.filter((f) => f.op === '+')).toHaveLength(FACTS_PER_SESSION / 2);
      expect(facts.filter((f) => f.op === '-')).toHaveLength(FACTS_PER_SESSION / 2);
    }
  });

  it('serves zero facts less often than their share', () => {
    let zeros = 0;
    const runs = 200;
    for (let run = 0; run < runs; run++) zeros += pickSessionFacts().filter(isZeroFact).length;
    const share = ALL_FACTS.filter(isZeroFact).length / ALL_FACTS.length;
    expect(zeros / (runs * FACTS_PER_SESSION)).toBeLessThan(share * 0.75);
  });

  it('brings back recently missed facts', () => {
    const history: SessionEntry[] = [
      {
        id: 'x',
        gameId: GAME_ID,
        gameTitle: 'Math Blasters',
        timestamp: 0,
        score: 0,
        maxScore: 0,
        total: 1,
        gotFirstTry: 0,
        avgTimeMs: 0,
        missedLetters: ['4+3'],
        slowLetters: [],
        items: ['4+3'],
      },
    ];
    let hits = 0;
    for (let run = 0; run < 100; run++) if (pickSessionFacts(history, 'add').some((f) => f.key === '4+3')) hits++;
    expect(hits).toBeGreaterThan(40);
  });

  it('always offers the answer once among distinct options in 0..10', () => {
    for (const fact of ALL_FACTS) {
      const options = buildOptions(fact);
      expect(options).toHaveLength(OPTION_COUNT);
      expect(new Set(options).size).toBe(OPTION_COUNT);
      expect(options.filter((n) => n === fact.answer)).toHaveLength(1);
      for (const n of options) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(MAX_NUMBER);
      }
    }
  });

  it('uses the likely mistakes as wrong answers: off by one, and the other operation', () => {
    for (let run = 0; run < 25; run++) {
      const options = buildOptions(parseFact('7-2')!);
      expect(options).toEqual(expect.arrayContaining([5, 4, 6, 9]));
    }
  });
});
