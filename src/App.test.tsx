import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { GAMES } from './games';

describe('App navigation', () => {
  it('shows every registered game on the home screen', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Kindergarten\s*Arcade/);
    for (const game of GAMES) expect(screen.getByText(game.title)).toBeInTheDocument();
  });

  it.each(GAMES.map((g) => [g.title]))('opens %s and returns home', async (title) => {
    render(<App />);
    await userEvent.click(screen.getByText(title));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(title);
    await userEvent.click(screen.getByRole('button', { name: 'Back to games' }));
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('opens the parent dashboard', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /For Parents/ }));
    expect(screen.getByRole('heading', { name: /Parent Dashboard/ })).toBeInTheDocument();
  });
});
