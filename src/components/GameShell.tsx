import type { ReactNode } from 'react';

interface Props {
  title: string;
  emoji: string;
  onExit: () => void;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function GameShell({ title, emoji, onExit, headerExtra, children }: Props) {
  return (
    <div className="game-shell">
      <div className="game-shell-bar">
        <button className="back-btn" onClick={onExit} aria-label="Back to games">
          ← Games
        </button>
        <h2>
          <span aria-hidden="true">{emoji}</span> {title}
        </h2>
        <div className="game-shell-bar-end">{headerExtra}</div>
      </div>
      {children}
    </div>
  );
}
