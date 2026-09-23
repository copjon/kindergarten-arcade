import type { GameMeta } from '../types/game';

interface Props {
  game: GameMeta;
  onSelect: (id: string) => void;
}

export function GameCard({ game, onSelect }: Props) {
  return (
    <button
      className="game-card"
      style={{ '--card-tint': game.color } as React.CSSProperties}
      onClick={() => onSelect(game.id)}
    >
      <span className="game-card-emoji" aria-hidden="true">
        {game.emoji}
      </span>
      <span className="game-card-title">{game.title}</span>
      <span className="game-card-tagline">{game.tagline}</span>
    </button>
  );
}
