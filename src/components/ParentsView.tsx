import { useMemo, useState } from 'react';
import { LETTERS } from '../data/letters';
import { clearHistory, loadHistory, type SessionEntry } from '../lib/history';
import { formatDate, formatTime } from '../lib/format';

interface Props {
  onBack: () => void;
}

interface LetterTally {
  letter: string;
  emoji: string;
  missCount: number;
  slowCount: number;
  weight: number;
}

function letterEmoji(letter: string): string {
  return LETTERS.find((l) => l.letter === letter)?.pictures[0].emoji ?? '';
}

export function ParentsView({ onBack }: Props) {
  const [history, setHistory] = useState<SessionEntry[]>(loadHistory);

  const tally = useMemo(() => {
    const map = new Map<string, LetterTally>();
    const bump = (letter: string, field: 'missCount' | 'slowCount', weight: number) => {
      const existing = map.get(letter) ?? { letter, emoji: letterEmoji(letter), missCount: 0, slowCount: 0, weight: 0 };
      existing[field] += 1;
      existing.weight += weight;
      map.set(letter, existing);
    };
    for (const entry of history) {
      entry.missedLetters.forEach((l) => bump(l, 'missCount', 2));
      entry.slowLetters.forEach((l) => bump(l, 'slowCount', 1));
    }
    return [...map.values()].sort((a, b) => b.weight - a.weight).slice(0, 10);
  }, [history]);

  function handleClear() {
    if (!window.confirm('Clear all saved game history? This cannot be undone.')) return;
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="parents-view">
      <div className="parents-bar">
        <button className="back-btn" onClick={onBack}>
          ← Games
        </button>
        <h2>👪 Parent Dashboard</h2>
        <div className="parents-bar-end" />
      </div>

      {history.length === 0 ? (
        <p className="parents-empty">No games played yet. Once your child finishes a round, results will show up here.</p>
      ) : (
        <>
          <section className="parents-card">
            <h3>Letters to work on</h3>
            {tally.length === 0 ? (
              <p className="report-empty">No trouble spots yet — great job!</p>
            ) : (
              <div className="review-grid">
                {tally.map((t) => (
                  <div className="review-chip" key={t.letter}>
                    <span className="review-emoji">{t.emoji}</span>
                    <span className="review-letter">
                      {t.letter.toUpperCase()}
                      {t.letter}
                    </span>
                    <span className="review-time">
                      {t.missCount} missed · {t.slowCount} slow
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="parents-card">
            <div className="parents-card-header">
              <h3>Game history</h3>
              <button className="clear-btn" onClick={handleClear}>
                Clear History
              </button>
            </div>
            <div className="history-list">
              {history.map((entry) => {
                const accuracy = entry.total ? Math.round((entry.gotFirstTry / entry.total) * 100) : 0;
                return (
                  <div className="history-row" key={entry.id}>
                    <div className="history-row-main">
                      <span className="history-game">{entry.gameTitle}</span>
                      <span className="history-date">{formatDate(entry.timestamp)}</span>
                    </div>
                    <div className="history-row-stats">
                      <span>
                        {entry.score}/{entry.maxScore} pts
                      </span>
                      <span>{accuracy}% first-try</span>
                      <span>avg {formatTime(entry.avgTimeMs)}</span>
                    </div>
                    {(entry.missedLetters.length > 0 || entry.slowLetters.length > 0) && (
                      <div className="history-row-letters">
                        {entry.missedLetters.map((l) => (
                          <span key={`m-${l}`} className="mini-tag missed">
                            {l.toUpperCase()}
                          </span>
                        ))}
                        {entry.slowLetters.map((l) => (
                          <span key={`s-${l}`} className="mini-tag slow">
                            {l.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
