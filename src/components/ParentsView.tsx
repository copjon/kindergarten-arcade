import { useMemo, useState } from 'react';
import { clearHistory, loadHistory, type SessionEntry } from '../lib/history';
import { formatDate, formatTime } from '../lib/format';
import { PRACTICE_KINDS, describeItem } from '../lib/itemDisplay';

interface Props {
  onBack: () => void;
}

interface Tally {
  item: string;
  missCount: number;
  slowCount: number;
  weight: number;
}

export function ParentsView({ onBack }: Props) {
  const [history, setHistory] = useState<SessionEntry[]>(loadHistory);

  const sections = useMemo(() => {
    const byGame = new Map<string, Map<string, Tally>>();
    for (const entry of history) {
      const tallies = byGame.get(entry.gameId) ?? new Map<string, Tally>();
      const bump = (item: string, field: 'missCount' | 'slowCount', weight: number) => {
        const existing = tallies.get(item) ?? { item, missCount: 0, slowCount: 0, weight: 0 };
        existing[field] += 1;
        existing.weight += weight;
        tallies.set(item, existing);
      };
      entry.missedLetters.forEach((item) => bump(item, 'missCount', 2));
      entry.slowLetters.forEach((item) => bump(item, 'slowCount', 1));
      byGame.set(entry.gameId, tallies);
    }
    return Object.entries(PRACTICE_KINDS)
      .filter(([gameId]) => byGame.has(gameId))
      .map(([gameId, kind]) => ({
        gameId,
        heading: kind.heading,
        tallies: [...byGame.get(gameId)!.values()].sort((a, b) => b.weight - a.weight).slice(0, 10),
      }));
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
          {sections.map((section) => (
            <section className="parents-card" key={section.gameId}>
              <h3>{section.heading}</h3>
              {section.tallies.length === 0 ? (
                <p className="report-empty">No trouble spots yet — great job!</p>
              ) : (
                <div className="review-grid">
                  {section.tallies.map((t) => {
                    const display = describeItem(section.gameId, t.item);
                    return (
                      <div className="review-chip" key={t.item}>
                        <span className="review-emoji">{display.icon}</span>
                        <span className="review-letter">{display.label}</span>
                        <span className="review-time">
                          {t.missCount} missed · {t.slowCount} slow
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

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
                        {entry.missedLetters.map((item) => (
                          <span key={`m-${item}`} className="mini-tag missed">
                            {describeItem(entry.gameId, item).tag}
                          </span>
                        ))}
                        {entry.slowLetters.map((item) => (
                          <span key={`s-${item}`} className="mini-tag slow">
                            {describeItem(entry.gameId, item).tag}
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
