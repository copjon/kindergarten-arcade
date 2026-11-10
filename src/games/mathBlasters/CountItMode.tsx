import { useState } from 'react';
import { ALL_FACTS, MAX_NUMBER, counterEmoji, makeFact, spokenFact, type MathOp } from '../../data/mathFacts';
import { pickRandom } from '../../data/phrases';
import type { useSpeech } from '../../hooks/useSpeech';
import { playBlasterSound, playErrorSound } from '../../lib/sound';
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
const NUMBERS = Array.from({ length: MAX_NUMBER + 1 }, (_, i) => i);

/**
 * Build any fact up to 10 (or roll a random one), work it out with the
 * pictures, and answer on the number pad. The game never counts or gives
 * the answer: the child does the counting and picks the number.
 */
export function CountItMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [op, setOp] = useState<MathOp>('+');
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const [message, setMessage] = useState('Count the pictures, then pick the answer!');

  const fact = makeFact(a, op, b);
  // Adding: the total stays within 10. Subtracting: never more than you have.
  const maxA = op === '+' ? MAX_NUMBER - b : MAX_NUMBER;
  const maxB = op === '+' ? MAX_NUMBER - a : a;

  function update(nextOp: MathOp, nextA: number, nextB: number) {
    const aa = clamp(nextA, 0, MAX_NUMBER);
    const bb = clamp(nextB, 0, nextOp === '+' ? MAX_NUMBER - aa : aa);
    setOp(nextOp);
    setA(aa);
    setB(bb);
    setSolved(false);
    setWrong(null);
    setMessage('Count the pictures, then pick the answer!');
  }

  function randomProblem() {
    const pool = ALL_FACTS.filter((f) => f.op === op && f.key !== fact.key && f.a > 0 && f.b > 0);
    const next = pickRandom(pool);
    update(next.op, next.a, next.b);
    speak(`What is ${spokenFact(next)}?`, { rate: 0.85 });
  }

  function answer(n: number) {
    if (solved) return;
    if (n !== fact.answer) {
      setWrong(n);
      setMessage(`Not ${n}. Count the pictures again! 👀`);
      playErrorSound();
      speak(`Not ${n}. Count again.`, { rate: 0.85 });
      setTimeout(() => setWrong(null), 450);
      return;
    }
    setSolved(true);
    setMessage('You got it! 🎉');
    playBlasterSound();
    speak(`Yes! ${spokenFact(fact)} is ${fact.answer}!`, { rate: 0.85, pitch: 1.2 });
  }

  return (
    <section className="explore-mode">
      <div className="letter-spotlight">
        <div className="op-filter" role="group" aria-label="Choose adding or subtracting">
          <button className={`op-pill ${op === '+' ? 'active' : ''}`} onClick={() => update('+', a, b)} aria-pressed={op === '+'}>
            ➕ Add
          </button>
          <button className={`op-pill ${op === '-' ? 'active' : ''}`} onClick={() => update('-', a, b)} aria-pressed={op === '-'}>
            ➖ Subtract
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
          <span className={`math-answer count-answer ${solved ? 'solved' : ''}`}>{solved ? fact.answer : '?'}</span>
        </div>

        <Counters key={fact.key} fact={fact} emoji={counterEmoji(fact)} onCount={(n) => speak(String(n), { rate: 1, pitch: 1.2 })} />

        <p className="count-message" aria-live="polite">
          {message}
        </p>
        <div className="number-pad" role="group" aria-label="Pick the answer">
          {NUMBERS.map((n) => (
            <button
              key={n}
              className={`letter-tile ${solved && n === fact.answer ? 'active' : ''} ${wrong === n ? 'wrong' : ''}`}
              onClick={() => answer(n)}
              aria-label={`answer ${n}`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="spotlight-controls">
          <button className="big-btn name" onClick={() => speak(`What is ${spokenFact(fact)}?`, { rate: 0.85 })}>
            🔊 Hear it
          </button>
          <button className="big-btn word" onClick={randomProblem}>
            🎲 New problem
          </button>
        </div>
      </div>
    </section>
  );
}
