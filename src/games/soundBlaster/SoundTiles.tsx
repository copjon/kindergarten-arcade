interface Props {
  word: string;
  /** How many letters, from the left, have been sounded (lit up). */
  litCount: number;
  onTap: (index: number) => void;
}

/** A word as letter blocks; lit blocks replay their sound, the next one pulses. */
export function SoundTiles({ word, litCount, onTap }: Props) {
  return (
    <div className="sound-tiles" role="group" aria-label="Letters to sound out">
      {[...word].map((letter, i) => {
        const lit = i < litCount;
        const next = i === litCount;
        return (
          <button
            key={i}
            className={`sound-tile ${lit ? 'lit' : ''} ${next ? 'next' : ''}`}
            onClick={() => onTap(i)}
            disabled={!lit && !next}
            aria-label={`Sound ${i + 1}: letter ${letter}`}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}
