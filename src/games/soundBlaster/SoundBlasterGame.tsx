import { useState } from 'react';
import { GameShell } from '../../components/GameShell';
import { VoicePicker } from '../../components/VoicePicker';
import { useSpeech } from '../../hooks/useSpeech';
import { BlastMode } from './BlastMode';
import { SoundLabMode } from './SoundLabMode';

type Mode = 'blast' | 'lab';

export function SoundBlasterGame({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<Mode>('blast');
  const speech = useSpeech();

  return (
    <GameShell title="Sound Blaster" emoji="🔊" onExit={onExit} headerExtra={<VoicePicker speech={speech} />}>
      <div className="mode-toggle" role="group" aria-label="Choose a game mode">
        <button
          className={`mode-pill ${mode === 'blast' ? 'active' : ''}`}
          onClick={() => setMode('blast')}
          aria-pressed={mode === 'blast'}
        >
          🎯 Blast
        </button>
        <button
          className={`mode-pill ${mode === 'lab' ? 'active' : ''}`}
          onClick={() => setMode('lab')}
          aria-pressed={mode === 'lab'}
        >
          🧪 Sound Lab
        </button>
      </div>

      {mode === 'blast' ? <BlastMode speech={speech} /> : <SoundLabMode speech={speech} />}
    </GameShell>
  );
}
