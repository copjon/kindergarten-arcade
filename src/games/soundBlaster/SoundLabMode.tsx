import { useState } from 'react';
import { CVC_WORDS } from '../../data/cvcWords';
import type { useSpeech } from '../../hooks/useSpeech';
import { SoundTiles } from './SoundTiles';
import { soundsFor } from './rounds';

type Speech = ReturnType<typeof useSpeech>;

export function SoundLabMode({ speech }: { speech: Speech }) {
  const { speak } = speech;
  const [index, setIndex] = useState(0);
  const current = CVC_WORDS[index];
  const sounds = soundsFor(current.word);

  const sayWord = () => speak(current.word, { rate: 0.8, pitch: 1.15 });
  async function soundItOut() {
    await speak(sounds.join('... '), { rate: 0.6 });
    await speak(sounds.join(' '), { rate: 1 });
    await speak(current.word, { rate: 0.8, pitch: 1.15 });
  }

  function select(i: number) {
    setIndex(i);
    speak(CVC_WORDS[i].word, { rate: 0.8, pitch: 1.15 });
  }

  return (
    <section className="explore-mode">
      <div className="letter-spotlight">
        <span className="learn-emoji" aria-hidden="true">
          {current.emoji}
        </span>
        <SoundTiles
          key={current.word}
          word={current.word}
          litCount={current.word.length}
          onTap={(i) => speak(sounds[i], { rate: 0.75 })}
        />
        <div className="spotlight-controls">
          <button className="big-btn sound" onClick={soundItOut}>
            🌀 Sound it out
          </button>
          <button className="big-btn word" onClick={sayWord}>
            📖 Say the word
          </button>
        </div>
        <p className="heart-tip">
          Tap each letter to hear its sound, then say the sounds faster and faster until they blend into the word.
        </p>
      </div>

      <div className="word-grid" role="group" aria-label="Words to sound out">
        {CVC_WORDS.map((w, i) => (
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
