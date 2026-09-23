import { useState } from 'react';
import { GameShell } from '../../components/GameShell';
import { VoicePicker } from '../../components/VoicePicker';
import { useSpeech } from '../../hooks/useSpeech';
import { ExploreMode } from './ExploreMode';
import { PictureMatchMode } from './PictureMatchMode';

type Mode = 'explore' | 'match';

export function LetterSoundsGame({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode>('match');
  const speech = useSpeech();

  return (
    <GameShell title="Alpha Blast" emoji="🚀" onExit={onExit} headerExtra={<VoicePicker speech={speech} />}>
      <div className="mode-toggle" role="group" aria-label="Choose a game mode">
        <button
          className={`mode-pill ${mode === 'match' ? 'active' : ''}`}
          onClick={() => setMode('match')}
          aria-pressed={mode === 'match'}
        >
          🖼️ Picture Match
        </button>
        <button
          className={`mode-pill ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => setMode('explore')}
          aria-pressed={mode === 'explore'}
        >
          🎈 Explore Letters
        </button>
      </div>

      {mode === 'explore' ? <ExploreMode speech={speech} /> : <PictureMatchMode speech={speech} />}
    </GameShell>
  );
}
