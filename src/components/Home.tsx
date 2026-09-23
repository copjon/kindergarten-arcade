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
        <h1>
          Phonics <span className="accent">Playground</span>
        </h1>
        <p className="home-subtitle">Pick a game and start reading!</p>
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
