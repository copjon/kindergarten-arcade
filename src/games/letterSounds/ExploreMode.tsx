import { useState } from 'react';
import { LETTERS, randomPicture, type LetterInfo, type LetterPicture } from '../../data/letters';
import type { useSpeech } from '../../hooks/useSpeech';

type Speech = ReturnType<typeof useSpeech>;

/** X's sound only shows up at the end of a word, so say where to listen for it. */
function soundToSay(letter: LetterInfo, picture: LetterPicture): string {
  return letter.soundAt === 'end' ? `${letter.sound}, at the end of ${picture.word}` : letter.sound;
}

interface Props {
  speech: Speech;
}

export function ExploreMode({ speech }: Props) {
  const [index, setIndex] = useState(0);
  const [picture, setPicture] = useState<LetterPicture>(() => randomPicture(LETTERS[0]));
  const [bump, setBump] = useState(false);
  const current = LETTERS[index];

  function select(i: number) {
    const nextPicture = randomPicture(LETTERS[i]);
    setIndex(i);
    setPicture(nextPicture);
    setBump(false);
    requestAnimationFrame(() => setBump(true));
    speech.speak(soundToSay(LETTERS[i], nextPicture), { rate: 0.75 });
  }

  function anotherPicture() {
    setPicture((p) => randomPicture(current, p));
    setBump(false);
    requestAnimationFrame(() => setBump(true));
  }

  return (
    <section className="explore-mode">
      <div className="letter-spotlight">
        <button
          className={`spotlight-emoji-btn ${bump ? 'bump' : ''}`}
          onClick={anotherPicture}
          aria-label={`Show another picture for ${current.letter}, currently ${picture.word}`}
          title="Tap for another picture"
        >
          <span role="img" aria-hidden="true">
            {picture.emoji}
          </span>
        </button>
        <div className="spotlight-letter">
          {current.letter.toUpperCase()}
          {current.letter}
        </div>
        <div className="spotlight-word">{picture.word}</div>
        {current.soundAt === 'end' && (
          <div className="spotlight-hint">{current.letter.toUpperCase()} is at the end!</div>
        )}
        <div className="spotlight-controls">
          <button
            className="big-btn name"
            onClick={() => speech.speak(current.letter.toUpperCase(), { rate: 0.8, pitch: 1.2 })}
          >
            🔤 Letter Name
          </button>
          <button className="big-btn sound" onClick={() => speech.speak(soundToSay(current, picture), { rate: 0.75 })}>
            🎵 Letter Sound
          </button>
          <button className="big-btn word" onClick={() => speech.speak(picture.word, { rate: 0.85, pitch: 1.2 })}>
            📖 Say the Word
          </button>
        </div>
      </div>

      <div className="letter-grid" role="group" aria-label="Alphabet">
        {LETTERS.map((l, i) => (
          <button
            key={l.letter}
            className={`letter-tile ${i === index ? 'active' : ''}`}
            onClick={() => select(i)}
            aria-label={`Letter ${l.letter}`}
          >
            {l.letter.toUpperCase()}
            {l.letter}
          </button>
        ))}
      </div>
    </section>
  );
}
