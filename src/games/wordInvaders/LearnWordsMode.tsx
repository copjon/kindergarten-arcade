import { useState } from 'react';
import { SIGHT_WORDS } from '../../data/sightWords';
import type { useSpeech } from '../../hooks/useSpeech';

type Speech = ReturnType<typeof useSpeech>;

function HighlightedSentence({ sentence, word }: { sentence: string; word: string }) {
  const parts = sentence.split(new RegExp(`\\b(${word})\\b`, 'i'));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="sentence-word">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function LearnWordsMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [index, setIndex] = useState(0);
  const current = SIGHT_WORDS[index];

  const sayIt = () => speak(current.word, { rate: 0.8, pitch: 1.15 });
  const spellIt = () =>
    speak(`${current.word.split('').map((c) => c.toUpperCase()).join(', ')}. ${current.word}!`, { rate: 0.7 });
  const inSentence = () => speak(current.sentence, { rate: 0.85 });

  function select(i: number) {
    setIndex(i);
    speak(SIGHT_WORDS[i].word, { rate: 0.8, pitch: 1.15 });
  }

  return (
    <section className="explore-mode">
      <div className="letter-spotlight">
        <span className="heart-badge">❤️ Heart word</span>
        <span className="learn-emoji" aria-hidden="true">
          {current.emoji}
        </span>
        <button className="learn-word" onClick={sayIt} aria-label={`Hear the word ${current.word}`}>
          {current.word}
        </button>
        <p className="learn-sentence">
          <HighlightedSentence sentence={current.sentence} word={current.word} />
        </p>
        <div className="spotlight-controls">
          <button className="big-btn name" onClick={sayIt}>
            🔊 Say it
          </button>
          <button className="big-btn sound" onClick={spellIt}>
            🔤 Spell it
          </button>
          <button className="big-btn word" onClick={inSentence}>
            💬 Sentence
          </button>
        </div>
        <p className="heart-tip">
          Heart words don't always follow the sound rules, so we don't sound them out — we learn them by heart!
        </p>
      </div>

      <div className="word-grid" role="group" aria-label="Heart words">
        {SIGHT_WORDS.map((w, i) => (
          <button
            key={w.word}
            className={`letter-tile ${i === index ? 'active' : ''}`}
            onClick={() => select(i)}
            aria-label={`Word ${w.word}`}
          >
            {w.word}
          </button>
        ))}
      </div>
    </section>
  );
}
