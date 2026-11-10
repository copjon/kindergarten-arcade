import { useState, type CSSProperties } from 'react';
import { MAX_NUMBER, type MathFact } from '../../data/mathFacts';
import { playPopSound, playSwooshSound } from '../../lib/sound';

interface Props {
  fact: MathFact;
  emoji: string;
}

/**
 * The child builds the problem out of pictures: press ＋ to make each one
 * appear (adding: one group per number; subtracting: make the first number,
 * then ✖ crosses them out one at a time). Nothing is counted, labeled with a
 * running total, or filled in for them; tapping a picture undoes it.
 * Remount with `key={fact.key}` to start fresh.
 */
export function PictureBuilder({ fact, emoji }: Props) {
  const adding = fact.op === '+';
  const [groups, setGroups] = useState<number[]>(adding ? [0, 0] : [0]);
  const [crossed, setCrossed] = useState(0);

  function addTo(g: number) {
    if (groups[g] >= MAX_NUMBER) return;
    setGroups(groups.map((n, i) => (i === g ? n + 1 : n)));
    playPopSound();
  }

  function removeFrom(g: number) {
    const next = groups.map((n, i) => (i === g ? Math.max(0, n - 1) : n));
    setGroups(next);
    setCrossed((c) => Math.min(c, next[0]));
  }

  function crossOne() {
    if (crossed >= groups[0]) return;
    setCrossed(crossed + 1);
    playSwooshSound();
  }

  function startOver() {
    setGroups(adding ? [0, 0] : [0]);
    setCrossed(0);
  }

  const targets = adding ? [fact.a, fact.b] : [fact.a];
  const touched = groups.some((n) => n > 0);

  return (
    <div className="builder" role="group" aria-label="Build it with pictures">
      <div className="builder-groups">
        {groups.map((count, g) => {
          // In a subtraction group, the last `crossed` pictures are crossed out.
          const firstCrossed = adding ? count : count - crossed;
          return (
            <div className="builder-group-wrap" key={g}>
              {g > 0 && (
                <span className="counter-op" aria-hidden="true">
                  +
                </span>
              )}
              <div className="builder-group">
                <span className="builder-target">
                  {adding ? `Make ${targets[g]}` : `Make ${fact.a}, then subtract ${fact.b}`}
                </span>
                <div
                  className="builder-tray"
                  style={{ '--cols': Math.min(5, Math.max(1, count)) } as CSSProperties}
                  aria-label={`group ${g + 1}`}
                >
                  {Array.from({ length: count }, (_, i) => {
                    const isCrossed = i >= firstCrossed;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`counter ${isCrossed ? 'gone' : ''}`}
                        onClick={() => (isCrossed ? setCrossed((c) => c - 1) : removeFrom(g))}
                        aria-label={isCrossed ? 'crossed out picture, tap to bring back' : 'picture, tap to remove'}
                      >
                        <span className="counter-emoji" aria-hidden="true">
                          {emoji}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="builder-buttons">
                  <button
                    type="button"
                    className="builder-btn add"
                    onClick={() => addTo(g)}
                    disabled={count >= MAX_NUMBER}
                    aria-label={adding ? `Add a picture to group ${g + 1}` : 'Add a picture'}
                  >
                    ＋ {emoji}
                  </button>
                  {!adding && (
                    <button
                      type="button"
                      className="builder-btn subtract"
                      onClick={crossOne}
                      disabled={crossed >= count}
                      aria-label="Subtract a picture"
                    >
                      ✖ Subtract
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {touched && (
        <button type="button" className="counter-reset" onClick={startOver}>
          ↺ Start over
        </button>
      )}
    </div>
  );
}
