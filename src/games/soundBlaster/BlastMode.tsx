import { useEffect, useRef, useState } from 'react';
import { CVC_WORDS } from '../../data/cvcWords';
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
import { describeCvcWord } from '../../lib/itemDisplay';
import { SoundTiles } from './SoundTiles';
import { buildOptions, buildSession, soundsFor } from './rounds';

type Speech = ReturnType<typeof useSpeech>;

const GAME_ID = 'sound-blaster';
const GAME_TITLE = 'Sound Blaster';
const HINT_AFTER_MISSES = 2;
const SOUND_PROMPT = 'Tap each letter to hear its sound! 👆';
const PICK_PROMPT = 'Blend the sounds. Blast the picture! 🎯';

const now = () => Date.now();
const emojiFor = (word: string) => CVC_WORDS.find((w) => w.word === word)!.emoji;

export function BlastMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [order, setOrder] = useState(buildSession);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState(() => buildOptions(order[0]));
  const [litCount, setLitCount] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState(SOUND_PROMPT);
  const [busy, setBusy] = useState(false);
  const [wrongWord, setWrongWord] = useState<string | null>(null);
  const [hitWord, setHitWord] = useState<string | null>(null);
  const [shotWord, setShotWord] = useState<string | null>(null);
  const [scoreBump, setScoreBump] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'report'>('playing');
  const pickStart = useRef(now());
  const savedRef = useRef(false);

  const target = order[index];
  const sounds = soundsFor(target);
  const allLit = litCount >= target.length;

  function resetRoundState() {
    setLitCount(0);
    setMisses(0);
    setWrongWord(null);
    setHitWord(null);
    setShotWord(null);
    setMessage(SOUND_PROMPT);
  }

  function startNewSession() {
    const nextOrder = buildSession();
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

  function tapLetter(i: number) {
    if (busy) return;
    speak(sounds[i], { rate: 0.75 });
    if (i !== litCount) return;
    const lit = i + 1;
    setLitCount(lit);
    if (lit === target.length) {
      setMessage(PICK_PROMPT);
      pickStart.current = now();
    }
  }

  // Slow, then faster, so the separate sounds run together into the word.
  async function blendIt() {
    await speak(sounds.join('... '), { rate: 0.6 });
    await speak(sounds.join(' '), { rate: 1 });
  }

  async function choose(word: string) {
    if (busy || !allLit) return;
    setShotWord(null);
    requestAnimationFrame(() => setShotWord(word));

    if (word !== target) {
      setMisses((m) => m + 1);
      setWrongWord(word);
      setMessage(`That's a ${word}. Sound it out again! 👆`);
      playErrorSound();
      speak(`That's a ${word}. Sound it out again.`, { rate: 0.85 });
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
    const timeMs = now() - pickStart.current;
    const points = pointsFor(missed, timeMs);
    setScore((s) => s + points);
    setResults((prev) => ({ ...prev, [word]: { missedFirstTry: missed, timeMs, points } }));
    setMessage(!missed && timeBonusFor(timeMs) >= MAX_SPEED_BONUS ? 'Super blender! ⚡' : pickRandom(CHEERS));

    await speak(`${sounds.join(', ')}. ${word}!`, { rate: 0.85, pitch: 1.2 });
    setTimeout(() => {
      setBusy(false);
      advance();
    }, 600);
  }

  useEffect(() => {
    if (phase !== 'report' || savedRef.current) return;
    savedRef.current = true;

    const entries = order.map((word) => ({ word, result: results[word] })).filter((e) => e.result);
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
      total: order.length,
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
        items={order}
        results={results}
        noun="words"
        perfectMessage="You sounded out every word. Super blender! 🎉"
        describe={describeCvcWord}
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
            Word {index + 1} of {order.length}
          </span>
          <span className={`quiz-score ${scoreBump ? 'bump' : ''}`}>⭐ {score} pts</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${((index + (hitWord ? 1 : 0)) / order.length) * 100}%` }}
          />
        </div>

        <SoundTiles key={index} word={target} litCount={litCount} onTap={tapLetter} />

        {allLit ? (
          <>
            <button className="big-btn sound" onClick={blendIt}>
              🌀 Blend it
            </button>
            <div className="quiz-options blast-options">
              {options.map((word) => (
                <button
                  key={word}
                  className={`opt picture-opt ${hitWord === word ? 'right' : ''} ${wrongWord === word ? 'wrong' : ''} ${
                    showHint && word === target ? 'hint' : ''
                  }`}
                  onClick={() => choose(word)}
                  aria-label={`picture ${word}`}
                >
                  {emojiFor(word)}
                  {shotWord === word && <LaserShot />}
                  {hitWord === word && <BlastBurst />}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="quiz-question">Start with the glowing letter, then go left to right</p>
        )}
      </div>
    </section>
  );
}
