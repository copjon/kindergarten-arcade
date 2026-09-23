import { LETTERS } from '../../data/letters';
import { formatTime } from '../../lib/format';
import { SLOW_ANSWER_MS } from '../../lib/constants';

export interface LetterResult {
  missedFirstTry: boolean;
  timeMs: number;
  points: number;
}

interface Props {
  score: number;
  maxScore: number;
  sessionOrder: string[];
  results: Record<string, LetterResult>;
  onPlayAgain: () => void;
}

export function SessionReport({ score, maxScore, sessionOrder, results, onPlayAgain }: Props) {
  const total = sessionOrder.length;
  const entries = sessionOrder.map((letter) => ({ letter, result: results[letter] })).filter((e) => e.result);

  const missedCount = entries.filter((e) => e.result.missedFirstTry).length;
  const gotFirstTry = total - missedCount;
  const avgTimeMs = entries.length ? entries.reduce((sum, e) => sum + e.result.timeMs, 0) / entries.length : 0;

  const reviewLetters = entries
    .filter((e) => e.result.missedFirstTry || e.result.timeMs > SLOW_ANSWER_MS)
    .sort((a, b) => {
      if (a.result.missedFirstTry !== b.result.missedFirstTry) return a.result.missedFirstTry ? -1 : 1;
      return b.result.timeMs - a.result.timeMs;
    });

  const perfect = reviewLetters.length === 0;

  return (
    <section className="report">
      <div className="report-card">
        <div className="report-emoji">{perfect ? '🏆' : reviewLetters.length <= total / 3 ? '🌟' : '💪'}</div>
        <h3>{perfect ? 'Perfect round!' : 'Nice work!'}</h3>
        <p className="report-score">
          {score} <span>/ {maxScore} pts</span>
        </p>
        <p className="report-tally">
          Got {gotFirstTry} of {total} letters right on the first try · avg {formatTime(avgTimeMs)} per letter
        </p>

        {perfect ? (
          <p className="report-empty">You know every letter sound, fast and confident. Amazing! 🎉</p>
        ) : (
          <div className="report-review">
            <h4>Letters to practice</h4>
            <div className="review-grid">
              {reviewLetters.map(({ letter, result }) => {
                const info = LETTERS.find((l) => l.letter === letter)!;
                return (
                  <div className="review-chip" key={letter}>
                    <span className="review-emoji">{info.pictures[0].emoji}</span>
                    <span className="review-letter">
                      {letter.toUpperCase()}
                      {letter}
                    </span>
                    <span className="review-time">{formatTime(result.timeMs)}</span>
                    <span className={`review-tag ${result.missedFirstTry ? 'missed' : 'slow'}`}>
                      {result.missedFirstTry ? 'Missed' : 'Slow'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button className="big-btn play-again" onClick={onPlayAgain}>
          🔁 Play Again
        </button>
      </div>
    </section>
  );
}
