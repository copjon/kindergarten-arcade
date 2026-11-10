import { useState, type CSSProperties } from 'react';
import type { MathFact } from '../../data/mathFacts';

interface Props {
  fact: MathFact;
  emoji: string;
  /** Says each number as the child counts; never says the total for them. */
  onCount?: (n: number) => void;
}

/**
 * Pictures the child works through themselves. Adding: tap every picture in
 * both groups to count them all. Subtracting: first cross out the second
 * number's worth, then tap to count what's left. Nothing is counted or
 * crossed out for them. Remount with `key={fact.key}` to reset.
 */
export function Counters({ fact, emoji, onCount }: Props) {
  const total = fact.op === '+' ? fact.a + fact.b : fact.a;
  const [crossed, setCrossed] = useState<Set<number>>(new Set());
  // Picture index -> the number the child said when tapping it.
  const [counts, setCounts] = useState<Map<number, number>>(new Map());

  const crossing = fact.op === '-' && crossed.size < fact.b;
  const left = total - crossed.size;
  const allCounted = !crossing && counts.size === left;

  function tap(i: number) {
    if (fact.op === '-' && counts.size === 0) {
      // While crossing out (and before counting starts), taps toggle so a slip can be undone.
      if (crossed.has(i)) {
        const next = new Set(crossed);
        next.delete(i);
        setCrossed(next);
        return;
      }
      if (crossing) {
        setCrossed(new Set(crossed).add(i));
        return;
      }
    }
    if (crossed.has(i) || counts.has(i)) return;
    const n = counts.size + 1;
    setCounts(new Map(counts).set(i, n));
    onCount?.(n);
  }

  function startOver() {
    setCrossed(new Set());
    setCounts(new Map());
  }

  const picture = (i: number) => {
    const isCrossed = crossed.has(i);
    const count = counts.get(i);
    return (
      <button
        key={i}
        type="button"
        className={`counter ${isCrossed ? 'gone' : ''} ${count ? 'counted' : ''}`}
        onClick={() => tap(i)}
        aria-label={isCrossed ? 'crossed out' : count ? `counted ${count}` : 'picture'}
      >
        <span className="counter-emoji" aria-hidden="true">
          {emoji}
        </span>
        {count && <span className="counter-badge">{count}</span>}
      </button>
    );
  };

  const group = (count: number, start: number) => (
    <span className="counter-group" style={{ '--cols': Math.min(5, Math.max(1, count)) } as CSSProperties}>
      {Array.from({ length: count }, (_, i) => picture(start + i))}
    </span>
  );

  let instruction: string;
  if (crossing) {
    const toGo = fact.b - crossed.size;
    instruction = crossed.size ? `Cross out ${toGo} more ✖` : `Subtract ${fact.b}: tap to cross out ${toGo} ✖`;
  } else if (left === 0) {
    instruction = 'None left to count! 🤔';
  } else if (allCounted) {
    instruction = 'You counted them all! Which number did you get? 🤔';
  } else if (counts.size === 0) {
    instruction = fact.op === '+' ? 'Tap each one to count them all! 👆' : 'Now tap to count the ones left! 👆';
  } else {
    instruction = 'Keep counting! 👆';
  }

  return (
    <div className="counters-wrap">
      <div className="counters" role="group" aria-label="Pictures to count">
        {fact.op === '+' ? (
          <>
            {group(fact.a, 0)}
            <span className="counter-op" aria-hidden="true">
              +
            </span>
            {group(fact.b, fact.a)}
          </>
        ) : (
          group(fact.a, 0)
        )}
      </div>
      <p className="counter-instruction" aria-live="polite">
        {instruction}
      </p>
      {(crossed.size > 0 || counts.size > 0) && (
        <button type="button" className="counter-reset" onClick={startOver}>
          ↺ Start over
        </button>
      )}
    </div>
  );
}
