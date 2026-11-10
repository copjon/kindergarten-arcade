import { useState } from 'react';
import { GameShell } from '../../components/GameShell';
import { VoicePicker } from '../../components/VoicePicker';
import { useSpeech } from '../../hooks/useSpeech';
import { BlastMode } from './BlastMode';
import { CountItMode } from './CountItMode';

type Mode = 'blast' | 'count';

export function MathBlastersGame({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode>('blast');
  const speech = useSpeech();

  return (
    <GameShell title="Math Blasters" emoji="🛸" onExit={onExit} headerExtra={<VoicePicker speech={speech} />}>
      <div className="mode-toggle" role="group" aria-label="Choose a game mode">
        <button
          className={`mode-pill ${mode === 'blast' ? 'active' : ''}`}
          onClick={() => setMode('blast')}
          aria-pressed={mode === 'blast'}
        >
          🛸 Blast
        </button>
        <button
          className={`mode-pill ${mode === 'count' ? 'active' : ''}`}
          onClick={() => setMode('count')}
          aria-pressed={mode === 'count'}
        >
          🍎 Count It
        </button>
      </div>

      {mode === 'blast' ? <BlastMode speech={speech} /> : <CountItMode speech={speech} />}
    </GameShell>
  );
}
