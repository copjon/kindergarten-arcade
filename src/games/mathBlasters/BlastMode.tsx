import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import { counterEmoji, spokenFact, writtenFact, type MathFact } from '../../data/mathFacts';
import { pickRandom } from '../../data/phrases';
import { SpeechBubble } from '../../components/SpeechBubble';
import { BlastBurst } from '../../components/BlastBurst';
import { LaserShot } from '../../components/LaserShot';
import { SessionReport, type ItemResult } from '../../components/SessionReport';
import type { useSpeech } from '../../hooks/useSpeech';
import { loadHistory, saveSessionEntry } from '../../lib/history';
import { SLOW_ANSWER_MS } from '../../lib/constants';
import { playBlasterSound, playErrorSound } from '../../lib/sound';
import { FIRST_TRY_POINTS, MAX_SPEED_BONUS, pointsFor, timeBonusFor } from '../../lib/scoring';
import { describeFact } from '../../lib/itemDisplay';
import { PictureBuilder } from './PictureBuilder';
import { GAME_ID, buildOptions, pickSessionFacts, type OpChoice } from './rounds';

type Speech = ReturnType<typeof useSpeech>;

const GAME_TITLE = 'Math Blasters';
const HINT_AFTER_MISSES = 2;
const PROMPT = 'Blast the answer! 🚀';
const OPS_KEY = 'mathBlasters.ops';

const MATH_CHEERS = [
  'Yes! You got it! 🎉',
  'Awesome job! ⭐',
  'Math superstar! 🌟',
  'Nailed it! 🙌',
  'Woohoo! That’s right! 🥳',
  'Super counting! 🔢',
  'You’re on fire! 🔥',
];

const OP_CHOICES: { value: OpChoice; label: string }[] = [
  { value: 'add', label: '➕ Add' },
  { value: 'subtract', label: '➖ Subtract' },
  { value: 'mix', label: '🔀 Mix' },
];

const now = () => Date.now();

function loadOps(): OpChoice {
  try {
    const saved = localStorage.getItem(OPS_KEY);
    if (saved === 'add' || saved === 'subtract' || saved === 'mix') return saved;
  } catch {
    /* ignore */
  }
  return 'mix';
}

function saveOps(ops: OpChoice) {
  try {
    localStorage.setItem(OPS_KEY, ops);
  } catch {
    /* ignore */
  }
}

const askFor = (fact: MathFact) => `What is ${spokenFact(fact)}?`;

export function BlastMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [ops, setOps] = useState<OpChoice>(loadOps);
  const [facts, setFacts] = useState(() => pickSessionFacts(loadHistory(), ops));
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState(() => buildOptions(facts[0]));
  const [wave, setWave] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [misses, setMisses] = useState(0);
  const [showBuilder, setShowBuilder] = useState(false);
  const [message, setMessage] = useState(PROMPT);
  const [busy, setBusy] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [hitAnswer, setHitAnswer] = useState<number | null>(null);
  const [shotAnswer, setShotAnswer] = useState<number | null>(null);
  const [scoreBump, setScoreBump] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'report'>('playing');
  const roundStart = useRef(now());
  const savedRef = useRef(false);

  const fact = facts[index];
  const maxScore = facts.length * (FIRST_TRY_POINTS + MAX_SPEED_BONUS);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setTimeout(() => speak(askFor(fact), { rate: 0.85 }), 400);
    return () => clearTimeout(id);
  }, [speak, fact, wave, phase]);

  function resetRoundState() {
    setWave(0);
    setMisses(0);
    setShowBuilder(false);
    setWrongAnswer(null);
    setHitAnswer(null);
    setShotAnswer(null);
    setMessage(PROMPT);
    roundStart.current = now();
  }

  function startNewSession(nextOps: OpChoice = ops) {
    const nextFacts = pickSessionFacts(loadHistory(), nextOps);
    setFacts(nextFacts);
    setIndex(0);
    setOptions(buildOptions(nextFacts[0]));
    setScore(0);
    setResults({});
    setBusy(false);
    setPhase('playing');
    savedRef.current = false;
    resetRoundState();
  }

  function chooseOps(next: OpChoice) {
    if (next === ops) return;
    setOps(next);
    saveOps(next);
    startNewSession(next);
  }

  function advance() {
    const next = index + 1;
    if (next >= facts.length) {
      setPhase('report');
      return;
    }
    setIndex(next);
    setOptions(buildOptions(facts[next]));
    resetRoundState();
  }

  function handleFleetLanded(e: AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || busy) return;
    setWrongAnswer(null);
    setShowBuilder(true);
    setMessage('Here they come again! Build it with pictures 👀');
    setWave((w) => w + 1);
  }

  async function choose(answer: number) {
    if (busy) return;
    setShotAnswer(null);
    requestAnimationFrame(() => setShotAnswer(answer));

    if (answer !== fact.answer) {
      setMisses((m) => m + 1);
      setWrongAnswer(answer);
      setShowBuilder(true);
      setMessage(`Not ${answer}. Build it with pictures and try again! 👀`);
      playErrorSound();
      speak(`Not ${answer}. Build it with pictures. ${askFor(fact)}`, { rate: 0.85 });
      setTimeout(() => {
        setWrongAnswer(null);
        setShotAnswer(null);
      }, 450);
      return;
    }

    setBusy(true);
    setHitAnswer(answer);
    playBlasterSound();
    setScoreBump(false);
    requestAnimationFrame(() => setScoreBump(true));

    const missed = misses > 0;
    const timeMs = now() - roundStart.current;
    const points = pointsFor(missed, timeMs);
    setScore((s) => s + points);
    setResults((prev) => ({ ...prev, [fact.key]: { missedFirstTry: missed, timeMs, points } }));
    setMessage(!missed && timeBonusFor(timeMs) >= MAX_SPEED_BONUS ? 'Direct hit! ⚡' : pickRandom(MATH_CHEERS));

    await speak(`${spokenFact(fact)} is ${fact.answer}!`, { rate: 0.9, pitch: 1.2 });
    setTimeout(() => {
      setBusy(false);
      advance();
    }, 600);
  }

  useEffect(() => {
    if (phase !== 'report' || savedRef.current) return;
    savedRef.current = true;

    const keys = facts.map((f) => f.key);
    const entries = keys.map((key) => ({ key, result: results[key] })).filter((e) => e.result);
    const missedFacts = entries.filter((e) => e.result.missedFirstTry).map((e) => e.key);
    const slowFacts = entries
      .filter((e) => !e.result.missedFirstTry && e.result.timeMs > SLOW_ANSWER_MS)
      .map((e) => e.key);
    const avgTimeMs = entries.length ? entries.reduce((sum, e) => sum + e.result.timeMs, 0) / entries.length : 0;

    saveSessionEntry({
      gameId: GAME_ID,
      gameTitle: GAME_TITLE,
      timestamp: now(),
      score,
      maxScore,
      total: keys.length,
      gotFirstTry: entries.length - missedFacts.length,
      avgTimeMs,
      missedLetters: missedFacts,
      slowLetters: slowFacts,
      items: keys,
    });
  }, [phase, facts, results, score, maxScore]);

  if (phase === 'report') {
    return (
      <SessionReport
        score={score}
        maxScore={maxScore}
        items={facts.map((f) => f.key)}
        results={results}
        noun="facts"
        perfectMessage="Every fact, first try! You're a math blaster! 🚀🎉"
        describe={describeFact}
        onPlayAgain={() => startNewSession()}
      />
    );
  }

  const showHint = misses >= HINT_AFTER_MISSES && hitAnswer === null;
  const optionClass = (n: number) =>
    `invader ${hitAnswer === n ? 'hit' : ''} ${wrongAnswer === n ? 'wrong' : ''} ${
      showHint && n === fact.answer ? 'hint' : ''
    }`;

  return (
    <section className="quiz-mode">
      <SpeechBubble message={message} />

      <div className="quiz-stage">
        <div className="op-filter" role="group" aria-label="Choose adding or subtracting">
          {OP_CHOICES.map((choice) => (
            <button
              key={choice.value}
              className={`op-pill ${ops === choice.value ? 'active' : ''}`}
              onClick={() => chooseOps(choice.value)}
              disabled={busy}
              aria-pressed={ops === choice.value}
            >
              {choice.label}
            </button>
          ))}
        </div>

        <div className="quiz-progress">
          <span>
            Problem {index + 1} of {facts.length}
          </span>
          <span className={`quiz-score ${scoreBump ? 'bump' : ''}`}>⭐ {score} pts</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((index + (hitAnswer !== null ? 1 : 0)) / facts.length) * 100}%` }}
          />
        </div>

        <p className="math-problem" aria-label={`${spokenFact(fact)} equals what?`}>
          {writtenFact(fact)} = <span className={`math-answer ${hitAnswer !== null ? 'solved' : ''}`}>
            {hitAnswer !== null ? fact.answer : '?'}
          </span>
        </p>

        {showBuilder && <PictureBuilder key={fact.key} fact={fact} emoji={counterEmoji(fact)} />}

        {showBuilder ? (
          // While he builds, the UFOs wait off-screen and the answers sit right under his pictures.
          <div className="answer-pad" role="group" aria-label="Pick the answer">
            {options.map((n) => (
              <button
                key={n}
                className={optionClass(n)}
                onClick={() => choose(n)}
                aria-label={`answer ${n}`}
              >
                <span className="invader-word">{n}</span>
                {hitAnswer === n && <BlastBurst />}
              </button>
            ))}
          </div>
        ) : null}

        <div className="invader-controls">
          <button className="big-btn name" onClick={() => speak(askFor(fact), { rate: 0.85 })}>
            🔊 Hear it
          </button>
          {!showBuilder && (
            <button className="big-btn word" onClick={() => setShowBuilder(true)}>
              {counterEmoji(fact)} Build it
            </button>
          )}
        </div>

        {!showBuilder && (
          <div className="invader-stage">
            <div
              key={`${index}-${wave}`}
              className={`invader-fleet math-fleet ${busy ? 'paused' : ''}`}
              onAnimationEnd={handleFleetLanded}
            >
              {options.map((n, i) => (
                <button
                  key={n}
                  className={optionClass(n)}
                  style={{ '--wiggle-delay': `${i * -0.25}s` } as CSSProperties}
                  onClick={() => choose(n)}
                  aria-label={`answer ${n}`}
                >
                  <span className="invader-alien" aria-hidden="true">
                    {hitAnswer === n ? '💥' : '🛸'}
                  </span>
                  <span className="invader-word">{n}</span>
                  {shotAnswer === n && <LaserShot from="below" />}
                  {hitAnswer === n && <BlastBurst />}
                </button>
              ))}
            </div>
            <div className={`cannon ${shotAnswer !== null ? 'firing' : ''}`} aria-hidden="true">
              🚀
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
