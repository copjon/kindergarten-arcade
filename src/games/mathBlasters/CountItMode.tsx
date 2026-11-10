import { useEffect, useRef, useState } from 'react';
import { MAX_NUMBER, counterEmoji, makeFact, spokenFact, writtenFact, type MathOp } from '../../data/mathFacts';
import type { useSpeech } from '../../hooks/useSpeech';
import { Counters } from './Counters';

type Speech = ReturnType<typeof useSpeech>;

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}

function Stepper({ label, value, min, max, onChange }: StepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button className="stepper-btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} up`}>
        ▲
      </button>
      <span className="stepper-value">{value}</span>
      <button className="stepper-btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} down`}>
        ▼
      </button>
    </div>
  );
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Build any fact up to 10 and count it out with pictures, one at a time. */
export function CountItMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [op, setOp] = useState<MathOp>('+');
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [counted, setCounted] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [counting, setCounting] = useState(false);
  const runRef = useRef(0);

  const fact = makeFact(a, op, b);
  // Adding: the total stays within 10. Taking away: never more than you have.
  const maxA = op === '+' ? MAX_NUMBER - b : MAX_NUMBER;
  const maxB = op === '+' ? MAX_NUMBER - a : a;

  useEffect(() => () => void runRef.current++, []);

  function reset() {
    runRef.current++;
    setCounting(false);
    setCounted(0);
    setRevealed(false);
  }

  function update(nextOp: MathOp, nextA: number, nextB: number) {
    reset();
    const aa = clamp(nextA, 0, MAX_NUMBER);
    const bb = clamp(nextB, 0, nextOp === '+' ? MAX_NUMBER - aa : aa);
    setOp(nextOp);
    setA(aa);
    setB(bb);
  }

  async function countAlong() {
    const run = ++runRef.current;
    setCounting(true);
    setRevealed(false);
    setCounted(0);
    await speak(spokenFact(fact), { rate: 0.85 });
    for (let i = 1; i <= fact.answer; i++) {
      if (runRef.current !== run) return;
      setCounted(i);
      await speak(String(i), { rate: 0.95, pitch: 1.2 });
    }
    if (runRef.current !== run) return;
    setRevealed(true);
    setCounting(false);
    await speak(`${spokenFact(fact)} is ${fact.answer}!`, { rate: 0.85, pitch: 1.2 });
  }

  function sayIt() {
    reset();
    setRevealed(true);
    speak(`${spokenFact(fact)} is ${fact.answer}!`, { rate: 0.85, pitch: 1.2 });
  }

  return (
    <section className="explore-mode">
      <div className="letter-spotlight">
        <div className="op-filter" role="group" aria-label="Choose adding or taking away">
          <button className={`op-pill ${op === '+' ? 'active' : ''}`} onClick={() => update('+', a, b)} aria-pressed={op === '+'}>
            ➕ Add
          </button>
          <button className={`op-pill ${op === '-' ? 'active' : ''}`} onClick={() => update('-', a, b)} aria-pressed={op === '-'}>
            ➖ Take away
          </button>
        </div>

        <div className="count-builder">
          <Stepper label="First number" value={a} min={op === '-' ? b : 0} max={maxA} onChange={(n) => update(op, n, b)} />
          <span className="count-op" aria-hidden="true">
            {op === '+' ? '+' : '−'}
          </span>
          <Stepper label="Second number" value={b} min={0} max={maxB} onChange={(n) => update(op, a, n)} />
          <span className="count-op" aria-hidden="true">
            =
          </span>
          <button
            className={`math-answer count-answer ${revealed ? 'solved' : ''}`}
            onClick={sayIt}
            aria-label={revealed ? `Answer ${fact.answer}` : 'Show the answer'}
          >
            {revealed ? fact.answer : '?'}
          </button>
        </div>

        <Counters fact={fact} emoji={counterEmoji(fact)} counted={counted} />
        <p className="count-tally" aria-live="polite">
          {counting && counted > 0 ? counted : revealed ? `${writtenFact(fact)} = ${fact.answer}` : ' '}
        </p>

        <div className="spotlight-controls">
          <button className="big-btn sound" onClick={countAlong}>
            🔢 Count with me
          </button>
          <button className="big-btn name" onClick={sayIt}>
            🔊 Say it
          </button>
        </div>
        <p className="heart-tip">
          {op === '+'
            ? 'Adding puts groups together. Count them all to find how many in all!'
            : 'Taking away crosses some out. Count the ones that are left!'}
        </p>
      </div>
    </section>
  );
}
