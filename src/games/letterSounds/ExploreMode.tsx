import { useState } from 'react';
import { LETTERS, randomPicture, type LetterPicture } from '../../data/letters';
import type { useSpeech } from '../../hooks/useSpeech';

type Speech = ReturnType<typeof useSpeech>;

interface Props {
  speech: Speech;
}

export function ExploreMode({ speech }: Props) {
  const [index, setIndex] = useState(0);
  const [picture, setPicture] = useState<LetterPicture>(() => randomPicture(LETTERS[0]));
  const [bump, setBump] = useState(false);
  const current = LETTERS[index];

  function select(i: number) {
    setIndex(i);
    setPicture(randomPicture(LETTERS[i]));
    setBump(false);
    requestAnimationFrame(() => setBump(true));
    speech.speak(LETTERS[i].sound, { rate: 0.75 });
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
        <div className="spotlight-controls">
          <button
            className="big-btn name"
            onClick={() => speech.speak(current.letter.toUpperCase(), { rate: 0.8, pitch: 1.2 })}
          >
            🔤 Letter Name
          </button>
          <button className="big-btn sound" onClick={() => speech.speak(current.sound, { rate: 0.75 })}>
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
