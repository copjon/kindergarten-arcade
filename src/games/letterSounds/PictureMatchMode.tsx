import { useCallback, useEffect, useRef, useState } from 'react';
import { LETTERS, randomPicture, type LetterInfo } from '../../data/letters';
import { CHEERS, OOPS, pickRandom } from '../../data/phrases';
import { SpeechBubble } from '../../components/SpeechBubble';
import { BlastBurst } from '../../components/BlastBurst';
import { LaserShot } from '../../components/LaserShot';
import type { useSpeech } from '../../hooks/useSpeech';
import { SessionReport, type LetterResult } from './SessionReport';
import { saveSessionEntry } from '../../lib/history';
import { SLOW_ANSWER_MS } from '../../lib/constants';
import { playBlasterSound, playErrorSound } from '../../lib/sound';

const GAME_ID = 'letter-sounds';
const GAME_TITLE = 'Alpha Blast';

type Speech = ReturnType<typeof useSpeech>;

interface Props {
  speech: Speech;
}

interface RoundOption {
  letter: string;
  word: string;
  emoji: string;
}

const FIRST_TRY_POINTS = 10;
const RETRY_POINTS = 5;
const DEFAULT_PROMPT = 'Which picture starts with this letter?';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function newSessionOrder(): string[] {
  return shuffle(LETTERS).map((l) => l.letter);
}

function timeBonusFor(ms: number): number {
  if (ms <= 3000) return 5;
  if (ms <= 6000) return 3;
  if (ms <= 10000) return 1;
  return 0;
}

function buildRound(letter: string): { target: LetterInfo; options: RoundOption[] } {
  const target = LETTERS.find((l) => l.letter === letter)!;
  const targetOption: RoundOption = { letter: target.letter, ...randomPicture(target) };
  const distractorLetters = shuffle(LETTERS.filter((l) => l.letter !== letter)).slice(0, 3);
  const distractorOptions: RoundOption[] = distractorLetters.map((l) => ({ letter: l.letter, ...randomPicture(l) }));
  return { target, options: shuffle([targetOption, ...distractorOptions]) };
}

export function PictureMatchMode({ speech }: Props) {
  const [sessionOrder, setSessionOrder] = useState(newSessionOrder);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(sessionOrder[0]));
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Record<string, LetterResult>>({});
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [message, setMessage] = useState(DEFAULT_PROMPT);
  const [busy, setBusy] = useState(false);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [rightLetter, setRightLetter] = useState<string | null>(null);
  const [shotLetter, setShotLetter] = useState<string | null>(null);
  const [phase, setPhase] = useState<'playing' | 'report'>('playing');
  const [scoreBump, setScoreBump] = useState(false);
  const roundStart = useRef(Date.now());
  const savedRef = useRef(false);

  const hearLetter = useCallback(() => {
    speech.speak(round.target.letter.toUpperCase(), { rate: 0.8, pitch: 1.2 });
  }, [speech, round.target]);

  function startNewSession() {
    const order = newSessionOrder();
    setSessionOrder(order);
    setIndex(0);
    setRound(buildRound(order[0]));
    setScore(0);
    setResults({});
    setMissedThisRound(false);
    setWrongLetter(null);
    setRightLetter(null);
    setShotLetter(null);
    setMessage(DEFAULT_PROMPT);
    setPhase('playing');
    roundStart.current = Date.now();
    savedRef.current = false;
  }

  function advance() {
    const next = index + 1;
    if (next >= sessionOrder.length) {
      setPhase('report');
      return;
    }
    setIndex(next);
    setRound(buildRound(sessionOrder[next]));
    setMissedThisRound(false);
    setWrongLetter(null);
    setRightLetter(null);
    setShotLetter(null);
    setMessage(DEFAULT_PROMPT);
    roundStart.current = Date.now();
  }

  async function choose(option: RoundOption) {
    if (busy) return;
    setShotLetter(null);
    requestAnimationFrame(() => setShotLetter(option.letter));
    if (option.letter === round.target.letter) {
      setBusy(true);
      setRightLetter(option.letter);
      playBlasterSound();
      setScoreBump(false);
      requestAnimationFrame(() => setScoreBump(true));
      const timeMs = Date.now() - roundStart.current;
      const bonus = timeBonusFor(timeMs);
      const points = (missedThisRound ? RETRY_POINTS : FIRST_TRY_POINTS) + bonus;
      setScore((s) => s + points);
      setResults((prev) => ({ ...prev, [option.letter]: { missedFirstTry: missedThisRound, timeMs, points } }));
      setMessage(!missedThisRound && bonus >= 5 ? 'Lightning fast! ⚡' : pickRandom(CHEERS));
      await speech.speak(`${option.letter.toUpperCase()} is for ${option.word}`, { rate: 0.85, pitch: 1.2 });
      setTimeout(() => {
        setBusy(false);
        advance();
      }, 900);
    } else {
      setWrongLetter(option.letter);
      setMissedThisRound(true);
      setMessage(pickRandom(OOPS));
      playErrorSound();
      setTimeout(() => {
        setWrongLetter(null);
        setShotLetter(null);
      }, 450);
    }
  }

  useEffect(() => {
    if (phase !== 'report' || savedRef.current) return;
    savedRef.current = true;

    const entries = sessionOrder.map((letter) => ({ letter, result: results[letter] })).filter((e) => e.result);
    const missedLetters = entries.filter((e) => e.result.missedFirstTry).map((e) => e.letter);
    const slowLetters = entries
      .filter((e) => !e.result.missedFirstTry && e.result.timeMs > SLOW_ANSWER_MS)
      .map((e) => e.letter);
    const avgTimeMs = entries.length ? entries.reduce((sum, e) => sum + e.result.timeMs, 0) / entries.length : 0;

    saveSessionEntry({
      gameId: GAME_ID,
      gameTitle: GAME_TITLE,
      timestamp: Date.now(),
      score,
      maxScore: sessionOrder.length * (FIRST_TRY_POINTS + 5),
      total: sessionOrder.length,
      gotFirstTry: entries.length - missedLetters.length,
      avgTimeMs,
      missedLetters,
      slowLetters,
    });
  }, [phase, sessionOrder, results, score]);

  if (phase === 'report') {
    return (
      <SessionReport
        score={score}
        maxScore={sessionOrder.length * (FIRST_TRY_POINTS + 5)}
        sessionOrder={sessionOrder}
        results={results}
        onPlayAgain={startNewSession}
      />
    );
  }

  return (
    <section className="quiz-mode">
      <SpeechBubble message={message} />

      <div className="quiz-stage">
        <div className="quiz-progress">
          <span>
            Letter {index + 1} of {sessionOrder.length}
          </span>
          <span className={`quiz-score ${scoreBump ? 'bump' : ''}`}>⭐ {score} pts</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((index + (rightLetter ? 1 : 0)) / sessionOrder.length) * 100}%` }}
          />
        </div>

        <div className="match-target">
          <button className="match-letter" onClick={hearLetter} aria-label={`Hear the letter ${round.target.letter}`}>
            {round.target.letter.toUpperCase()}
            {round.target.letter}
          </button>
        </div>
        <p className="quiz-question">Tap the picture that starts with this letter</p>

        <div className="quiz-options picture-options">
          {round.options.map((opt) => (
            <button
              key={`${opt.letter}-${opt.word}`}
              className={`opt picture-opt ${rightLetter === opt.letter ? 'right' : ''} ${
                wrongLetter === opt.letter ? 'wrong' : ''
              }`}
              onClick={() => choose(opt)}
              aria-label={opt.word}
            >
              {opt.emoji}
              {shotLetter === opt.letter && <LaserShot />}
              {rightLetter === opt.letter && <BlastBurst />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
