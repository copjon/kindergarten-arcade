import { formatTime } from '../lib/format';
import { SLOW_ANSWER_MS } from '../lib/constants';
import type { ItemDisplay } from '../lib/itemDisplay';

export interface ItemResult {
  missedFirstTry: boolean;
  timeMs: number;
  points: number;
}

interface Props {
  score: number;
  maxScore: number;
  items: string[];
  results: Record<string, ItemResult>;
  noun: string;
  perfectMessage: string;
  describe: (item: string) => ItemDisplay;
  onPlayAgain: () => void;
}

export function SessionReport({ score, maxScore, items, results, noun, perfectMessage, describe, onPlayAgain }: Props) {
  const total = items.length;
  const entries = items.map((item) => ({ item, result: results[item] })).filter((e) => e.result);

  const missedCount = entries.filter((e) => e.result.missedFirstTry).length;
  const gotFirstTry = total - missedCount;
  const avgTimeMs = entries.length ? entries.reduce((sum, e) => sum + e.result.timeMs, 0) / entries.length : 0;

  const review = entries
    .filter((e) => e.result.missedFirstTry || e.result.timeMs > SLOW_ANSWER_MS)
    .sort((a, b) => {
      if (a.result.missedFirstTry !== b.result.missedFirstTry) return a.result.missedFirstTry ? -1 : 1;
      return b.result.timeMs - a.result.timeMs;
    });

  const perfect = review.length === 0;

  return (
    <section className="report">
      <div className="report-card">
        <div className="report-emoji">{perfect ? '🏆' : review.length <= total / 3 ? '🌟' : '💪'}</div>
        <h3>{perfect ? 'Perfect round!' : 'Nice work!'}</h3>
        <p className="report-score">
          {score} <span>/ {maxScore} pts</span>
        </p>
        <p className="report-tally">
          Got {gotFirstTry} of {total} {noun} right on the first try · avg {formatTime(avgTimeMs)} each
        </p>

        {perfect ? (
          <p className="report-empty">{perfectMessage}</p>
        ) : (
          <div className="report-review">
            <h4>{noun[0].toUpperCase() + noun.slice(1)} to practice</h4>
            <div className="review-grid">
              {review.map(({ item, result }) => {
                const display = describe(item);
                return (
                  <div className="review-chip" key={item}>
                    <span className="review-emoji">{display.icon}</span>
                    <span className="review-letter">{display.label}</span>
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
