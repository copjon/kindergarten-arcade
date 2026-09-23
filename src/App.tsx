import { useState } from 'react';
import { Home } from './components/Home';
import { ParentsView } from './components/ParentsView';
import { GAMES } from './games';

function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [showParents, setShowParents] = useState(false);
  const activeGame = GAMES.find((g) => g.id === activeGameId);

  if (showParents) {
    return <ParentsView onBack={() => setShowParents(false)} />;
  }

  if (activeGame) {
    const { Component } = activeGame;
    return <Component onExit={() => setActiveGameId(null)} />;
  }

  return <Home onSelectGame={setActiveGameId} onShowParents={() => setShowParents(true)} />;
}

export default App;
