import type { MathFact } from '../../data/mathFacts';

interface Props {
  fact: MathFact;
  emoji: string;
  /** Highlights the first `counted` objects that are still there (for counting along). */
  counted?: number;
}

/**
 * A picture of the fact to count: two groups for adding, and for taking away
 * one group with the last few crossed out.
 */
export function Counters({ fact, emoji, counted = 0 }: Props) {
  const item = (i: number, gone = false) => (
    <span key={i} className={`counter ${gone ? 'gone' : ''} ${!gone && i < counted ? 'counted' : ''}`}>
      <span className="counter-emoji">{emoji}</span>
    </span>
  );
  const label =
    fact.op === '+'
      ? `${fact.a} and ${fact.b} more, ${fact.answer} in all`
      : `${fact.a}, take away ${fact.b}, ${fact.answer} left`;

  if (fact.op === '+') {
    return (
      <div className="counters" role="img" aria-label={label}>
        <span className="counter-group">{Array.from({ length: fact.a }, (_, i) => item(i))}</span>
        <span className="counter-op" aria-hidden="true">
          +
        </span>
        <span className="counter-group">{Array.from({ length: fact.b }, (_, i) => item(fact.a + i))}</span>
      </div>
    );
  }

  return (
    <div className="counters" role="img" aria-label={label}>
      <span className="counter-group">{Array.from({ length: fact.a }, (_, i) => item(i, i >= fact.answer))}</span>
    </div>
  );
}
