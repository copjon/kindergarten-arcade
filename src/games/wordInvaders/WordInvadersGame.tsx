import { useState } from 'react';
import { GameShell } from '../../components/GameShell';
import { VoicePicker } from '../../components/VoicePicker';
import { useSpeech } from '../../hooks/useSpeech';
import { InvadersMode } from './InvadersMode';
import { LearnWordsMode } from './LearnWordsMode';

type Mode = 'invaders' | 'learn';

export function WordInvadersGame({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode>('invaders');
  const speech = useSpeech();

  return (
    <GameShell title="Word Invaders" emoji="👾" onExit={onExit} headerExtra={<VoicePicker speech={speech} />}>
      <div className="mode-toggle" role="group" aria-label="Choose a game mode">
        <button
          className={`mode-pill ${mode === 'invaders' ? 'active' : ''}`}
          onClick={() => setMode('invaders')}
          aria-pressed={mode === 'invaders'}
        >
          👾 Invaders
        </button>
        <button
          className={`mode-pill ${mode === 'learn' ? 'active' : ''}`}
          onClick={() => setMode('learn')}
          aria-pressed={mode === 'learn'}
        >
          ❤️ Learn Words
        </button>
      </div>

      {mode === 'invaders' ? <InvadersMode speech={speech} /> : <LearnWordsMode speech={speech} />}
    </GameShell>
  );
}
