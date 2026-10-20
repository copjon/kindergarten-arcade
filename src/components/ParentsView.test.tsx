import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentsView } from './ParentsView';
import { loadHistory, saveSessionEntry } from '../lib/history';

function seed() {
  saveSessionEntry({
    gameId: 'letter-sounds',
    gameTitle: 'Alpha Blast',
    timestamp: 1,
    score: 300,
    maxScore: 390,
    total: 26,
    gotFirstTry: 24,
    avgTimeMs: 3000,
    missedLetters: ['q'],
    slowLetters: ['w'],
  });
  saveSessionEntry({
    gameId: 'sight-words',
    gameTitle: 'Word Invaders',
    timestamp: 2,
    score: 150,
    maxScore: 270,
    total: 9,
    gotFirstTry: 7,
    avgTimeMs: 4000,
    missedLetters: ['the'],
    slowLetters: ['am'],
  });
}

describe('ParentsView', () => {
  it('explains the empty state before any games are played', () => {
    render(<ParentsView onBack={() => {}} />);
    expect(screen.getByText(/No games played yet/)).toBeInTheDocument();
  });

  it('groups practice items per game and keeps words in their real case', () => {
    seed();
    render(<ParentsView onBack={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Words to work on' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Letters to work on' })).toBeInTheDocument();
    expect(screen.getAllByText('the').length).toBeGreaterThan(0);
    expect(screen.queryByText('THE')).not.toBeInTheDocument();
    expect(screen.getByText('Q')).toBeInTheDocument();
    expect(screen.getByText('Qq')).toBeInTheDocument();
  });

  it('clears history only after the parent confirms', async () => {
    seed();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<ParentsView onBack={() => {}} />);

    await userEvent.click(screen.getByRole('button', { name: 'Clear History' }));
    expect(loadHistory()).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Clear History' }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(loadHistory()).toHaveLength(0);
    expect(screen.getByText(/No games played yet/)).toBeInTheDocument();
  });
});
