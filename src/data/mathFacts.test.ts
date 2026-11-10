import { describe, expect, it } from 'vitest';
import { ADDITION_FACTS, ALL_FACTS, MAX_NUMBER, SUBTRACTION_FACTS, parseFact, spokenFact, writtenFact } from './mathFacts';

describe('math facts', () => {
  it('keeps every number in a fact within 0..10', () => {
    for (const f of ALL_FACTS) {
      for (const n of [f.a, f.b, f.answer]) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(MAX_NUMBER);
      }
    }
  });

  it('covers every addition and subtraction fact up to 10 exactly once', () => {
    expect(ADDITION_FACTS).toHaveLength(66);
    expect(SUBTRACTION_FACTS).toHaveLength(66);
    expect(new Set(ALL_FACTS.map((f) => f.key)).size).toBe(ALL_FACTS.length);
  });

  it('computes answers correctly', () => {
    expect(parseFact('3+4')!.answer).toBe(7);
    expect(parseFact('9-6')!.answer).toBe(3);
  });

  it('round-trips keys and rejects junk', () => {
    for (const f of ALL_FACTS) expect(parseFact(f.key)).toEqual(f);
    expect(parseFact('the')).toBeNull();
  });

  it('writes and speaks facts in kid-friendly words', () => {
    expect(writtenFact(parseFact('7-2')!)).toBe('7 − 2');
    expect(spokenFact(parseFact('7-2')!)).toBe('7 take away 2');
    expect(spokenFact(parseFact('3+4')!)).toBe('3 plus 4');
  });
});
