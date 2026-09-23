import { GAMES } from '../games';
import { GameCard } from './GameCard';

interface Props {
  onSelectGame: (id: string) => void;
  onShowParents: () => void;
}

export function Home({ onSelectGame, onShowParents }: Props) {
  return (
    <div className="home">
      <header className="home-header">
        <div className="marquee">
          <h1>
            Kindergarten <span className="accent">Arcade</span>
          </h1>
        </div>
        <p className="home-subtitle">🪙 Pick a game and start playing!</p>
      </header>
      <div className="game-grid">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} onSelect={onSelectGame} />
        ))}
      </div>
      <button className="parents-link" onClick={onShowParents}>
        👪 For Parents
      </button>
    </div>
  );
}
