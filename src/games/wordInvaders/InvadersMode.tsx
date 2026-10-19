import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react';
import { SIGHT_WORDS } from '../../data/sightWords';
import { CHEERS, pickRandom } from '../../data/phrases';
import { SpeechBubble } from '../../components/SpeechBubble';
import { BlastBurst } from '../../components/BlastBurst';
import { LaserShot } from '../../components/LaserShot';
import { SessionReport, type ItemResult } from '../../components/SessionReport';
import type { useSpeech } from '../../hooks/useSpeech';
import { saveSessionEntry } from '../../lib/history';
import { SLOW_ANSWER_MS } from '../../lib/constants';
import { playBlasterSound, playErrorSound } from '../../lib/sound';
import { FIRST_TRY_POINTS, MAX_SPEED_BONUS, pointsFor, timeBonusFor } from '../../lib/scoring';
import { shuffle } from '../../lib/random';
import { describeWord } from '../../lib/itemDisplay';

type Speech = ReturnType<typeof useSpeech>;

const GAME_ID = 'sight-words';
const GAME_TITLE = 'Word Invaders';
const APPEARANCES_PER_WORD = 2;
const OPTION_COUNT = 4;
const HINT_AFTER_MISSES = 2;
const PROMPT = 'Blast the word you hear! 👂';
const ALL_WORDS = SIGHT_WORDS.map((w) => w.word);

const now = () => Date.now();

function buildOrder(): string[] {
  const pool = ALL_WORDS.flatMap((w) => Array<string>(APPEARANCES_PER_WORD).fill(w));
  for (let attempt = 0; attempt < 100; attempt++) {
    const order = shuffle(pool);
    if (order.every((w, i) => i === 0 || w !== order[i - 1])) return order;
  }
  return shuffle(pool);
}

function buildOptions(target: string): string[] {
  const others = shuffle(ALL_WORDS.filter((w) => w !== target)).slice(0, OPTION_COUNT - 1);
  return shuffle([target, ...others]);
}

export function InvadersMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [order, setOrder] = useState(buildOrder);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState(() => buildOptions(order[0]));
  const [wave, setWave] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState(PROMPT);
  const [busy, setBusy] = useState(false);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [hitWord, setHitWord] = useState<string | null>(null);
  const [shotWord, setShotWord] = useState<string | null>(null);
  const [scoreBump, setScoreBump] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'report'>('playing');
  const roundStart = useRef(now());
  const savedRef = useRef(false);

  const target = order[index];
  const targetInfo = SIGHT_WORDS.find((w) => w.word === target)!;

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setTimeout(() => speak(target, { rate: 0.8, pitch: 1.1 }), 400);
    return () => clearTimeout(id);
  }, [speak, target, index, wave, phase]);

  function resetRoundState() {
    setWave(0);
    setMisses(0);
    setWrongWord(null);
    setHitWord(null);
    setShotWord(null);
    setMessage(PROMPT);
    roundStart.current = now();
  }

  function startNewSession() {
    const nextOrder = buildOrder();
    setOrder(nextOrder);
    setIndex(0);
    setOptions(buildOptions(nextOrder[0]));
    setScore(0);
    setResults({});
    setPhase('playing');
    savedRef.current = false;
    resetRoundState();
  }

  function advance() {
    const next = index + 1;
    if (next >= order.length) {
      setPhase('report');
      return;
    }
    setIndex(next);
    setOptions(buildOptions(order[next]));
    resetRoundState();
  }

  function handleFleetLanded(e: AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || busy) return;
    setWrongWord(null);
    setMessage("They're getting away! Listen again 👂");
    setWave((w) => w + 1);
  }

  async function choose(word: string) {
    if (busy) return;
    setShotWord(null);
    requestAnimationFrame(() => setShotWord(word));

    if (word !== target) {
      setMisses((m) => m + 1);
      setWrongWord(word);
      setMessage(`That one says "${word}". Try again! 👂`);
      playErrorSound();
      speak(`That says ${word}. Find ${target}.`, { rate: 0.85 });
      setTimeout(() => {
        setWrongWord(null);
        setShotWord(null);
      }, 450);
      return;
    }

    setBusy(true);
    setHitWord(word);
    playBlasterSound();
    setScoreBump(false);
    requestAnimationFrame(() => setScoreBump(true));

    const missed = misses > 0;
    const timeMs = now() - roundStart.current;
    const points = pointsFor(missed, timeMs);
    setScore((s) => s + points);
    setResults((prev) => {
      const old = prev[word];
      const merged: ItemResult = old
        ? { missedFirstTry: old.missedFirstTry || missed, timeMs: Math.max(old.timeMs, timeMs), points: old.points + points }
        : { missedFirstTry: missed, timeMs, points };
      return { ...prev, [word]: merged };
    });
    setMessage(!missed && timeBonusFor(timeMs) >= MAX_SPEED_BONUS ? 'Direct hit! ⚡' : pickRandom(CHEERS));

    await speak(word, { rate: 0.85, pitch: 1.2 });
    setTimeout(() => {
      setBusy(false);
      advance();
    }, 600);
  }

  useEffect(() => {
    if (phase !== 'report' || savedRef.current) return;
    savedRef.current = true;

    const entries = ALL_WORDS.map((word) => ({ word, result: results[word] })).filter((e) => e.result);
    const missedWords = entries.filter((e) => e.result.missedFirstTry).map((e) => e.word);
    const slowWords = entries
      .filter((e) => !e.result.missedFirstTry && e.result.timeMs > SLOW_ANSWER_MS)
      .map((e) => e.word);
    const avgTimeMs = entries.length ? entries.reduce((sum, e) => sum + e.result.timeMs, 0) / entries.length : 0;

    saveSessionEntry({
      gameId: GAME_ID,
      gameTitle: GAME_TITLE,
      timestamp: now(),
      score,
      maxScore: order.length * (FIRST_TRY_POINTS + MAX_SPEED_BONUS),
      total: ALL_WORDS.length,
      gotFirstTry: entries.length - missedWords.length,
      avgTimeMs,
      missedLetters: missedWords,
      slowLetters: slowWords,
    });
  }, [phase, order, results, score]);

  if (phase === 'report') {
    return (
      <SessionReport
        score={score}
        maxScore={order.length * (FIRST_TRY_POINTS + MAX_SPEED_BONUS)}
        items={ALL_WORDS}
        results={results}
        noun="words"
        perfectMessage="You know all your heart words by heart! ❤️🎉"
        describe={describeWord}
        onPlayAgain={startNewSession}
      />
    );
  }

  const showHint = misses >= HINT_AFTER_MISSES && !hitWord;

  return (
    <section className="quiz-mode">
      <SpeechBubble message={message} />

      <div className="quiz-stage">
        <div className="quiz-progress">
          <span>
            Wave {index + 1} of {order.length}
          </span>
          <span className={`quiz-score ${scoreBump ? 'bump' : ''}`}>⭐ {score} pts</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((index + (hitWord ? 1 : 0)) / order.length) * 100}%` }}
          />
        </div>

        <div className="invader-controls">
          <button className="big-btn name" onClick={() => speak(target, { rate: 0.8, pitch: 1.1 })}>
            🔊 Hear it
          </button>
          <button className="big-btn word" onClick={() => speak(targetInfo.sentence, { rate: 0.85 })}>
            💬 In a sentence
          </button>
        </div>

        <div className="invader-stage">
          <div
            key={`${index}-${wave}`}
            className={`invader-fleet ${busy ? 'paused' : ''}`}
            onAnimationEnd={handleFleetLanded}
          >
            {options.map((word, i) => (
              <button
                key={word}
                className={`invader ${hitWord === word ? 'hit' : ''} ${wrongWord === word ? 'wrong' : ''} ${
                  showHint && word === target ? 'hint' : ''
                }`}
                style={{ '--wiggle-delay': `${i * -0.25}s` } as CSSProperties}
                onClick={() => choose(word)}
                aria-label={`word ${word}`}
              >
                <span className="invader-alien" aria-hidden="true">
                  {hitWord === word ? '💥' : '👾'}
                </span>
                <span className="invader-word">{word}</span>
                {shotWord === word && <LaserShot from="below" />}
                {hitWord === word && <BlastBurst />}
              </button>
            ))}
          </div>
          <div className={`cannon ${shotWord ? 'firing' : ''}`} aria-hidden="true">
            🚀
          </div>
        </div>
      </div>
    </section>
  );
}
