import { useCallback, useEffect, useRef, useState } from 'react';
import { LETTERS, randomPicture, type LetterInfo, type LetterPicture } from '../../data/letters';
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

type RoundMode = 'pickPicture' | 'pickLetter';

interface RoundOption {
  letter: string;
  word?: string;
  emoji?: string;
}

interface Round {
  mode: RoundMode;
  target: LetterInfo;
  picture: LetterPicture;
  options: RoundOption[];
}

const FIRST_TRY_POINTS = 10;
const RETRY_POINTS = 5;
const PROMPTS: Record<RoundMode, string> = {
  pickPicture: 'Which picture starts with this letter?',
  pickLetter: 'Which letter does this picture start with?',
};

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

function buildRound(letter: string): Round {
  const target = LETTERS.find((l) => l.letter === letter)!;
  const picture = randomPicture(target);
  const mode: RoundMode = Math.random() < 0.5 ? 'pickPicture' : 'pickLetter';
  const distractorLetters = shuffle(LETTERS.filter((l) => l.letter !== letter)).slice(0, 3);

  const options: RoundOption[] =
    mode === 'pickPicture'
      ? shuffle([{ letter: target.letter, ...picture }, ...distractorLetters.map((l) => ({ letter: l.letter, ...randomPicture(l) }))])
      : shuffle([{ letter: target.letter }, ...distractorLetters.map((l) => ({ letter: l.letter }))]);

  return { mode, target, picture, options };
}

export function PictureMatchMode({ speech }: Props) {
  const [sessionOrder, setSessionOrder] = useState(newSessionOrder);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound(sessionOrder[0]));
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Record<string, LetterResult>>({});
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [message, setMessage] = useState(() => PROMPTS[round.mode]);
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

  const hearPicture = useCallback(() => {
    speech.speak(round.picture.word, { rate: 0.85, pitch: 1.2 });
  }, [speech, round.picture]);

  function startNewSession() {
    const order = newSessionOrder();
    const firstRound = buildRound(order[0]);
    setSessionOrder(order);
    setIndex(0);
    setRound(firstRound);
    setScore(0);
    setResults({});
    setMissedThisRound(false);
    setWrongLetter(null);
    setRightLetter(null);
    setShotLetter(null);
    setMessage(PROMPTS[firstRound.mode]);
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
    const nextRound = buildRound(sessionOrder[next]);
    setIndex(next);
    setRound(nextRound);
    setMissedThisRound(false);
    setWrongLetter(null);
    setRightLetter(null);
    setShotLetter(null);
    setMessage(PROMPTS[nextRound.mode]);
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
      await speech.speak(`${option.letter.toUpperCase()} is for ${round.picture.word}`, { rate: 0.85, pitch: 1.2 });
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

  const isPickPicture = round.mode === 'pickPicture';

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
          {isPickPicture ? (
            <button className="match-letter" onClick={hearLetter} aria-label={`Hear the letter ${round.target.letter}`}>
              {round.target.letter.toUpperCase()}
              {round.target.letter}
            </button>
          ) : (
            <button className="match-picture" onClick={hearPicture} aria-label={`Hear the word for this picture`}>
              {round.picture.emoji}
            </button>
          )}
        </div>
        <p className="quiz-question">
          {isPickPicture ? 'Tap the picture that starts with this letter' : 'Tap the letter this picture starts with'}
        </p>

        <div className={`quiz-options ${isPickPicture ? 'picture-options' : ''}`}>
          {round.options.map((opt) => (
            <button
              key={opt.letter}
              className={`opt ${isPickPicture ? 'picture-opt' : ''} ${rightLetter === opt.letter ? 'right' : ''} ${
                wrongLetter === opt.letter ? 'wrong' : ''
              }`}
              onClick={() => choose(opt)}
              aria-label={isPickPicture ? opt.word : `letter ${opt.letter}`}
            >
              {isPickPicture ? (
                opt.emoji
              ) : (
                <>
                  {opt.letter.toUpperCase()}
                  {opt.letter}
                </>
              )}
              {shotLetter === opt.letter && <LaserShot />}
              {rightLetter === opt.letter && <BlastBurst />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
