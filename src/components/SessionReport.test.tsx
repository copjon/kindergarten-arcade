import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionReport } from './SessionReport';
import { describeWord } from '../lib/itemDisplay';

const baseProps = {
  score: 120,
  maxScore: 270,
  items: ['I', 'the', 'to', 'am'],
  noun: 'words',
  perfectMessage: 'All heart words!',
  describe: describeWord,
};

describe('SessionReport', () => {
  it('lists missed words before slow ones and skips the solid ones', () => {
    render(
      <SessionReport
        {...baseProps}
        results={{
          I: { missedFirstTry: false, timeMs: 1500, points: 15 },
          the: { missedFirstTry: false, timeMs: 9000, points: 11 },
          to: { missedFirstTry: true, timeMs: 4000, points: 8 },
          am: { missedFirstTry: false, timeMs: 2000, points: 15 },
        }}
        onPlayAgain={() => {}}
      />,
    );
    expect(screen.getByText('Got 3 of 4 words right on the first try · avg 4.1s each')).toBeInTheDocument();
    expect(screen.getByText('Words to practice')).toBeInTheDocument();
    const labels = [...document.querySelectorAll('.review-chip .review-letter')].map((el) => el.textContent);
    expect(labels).toEqual(['to', 'the']);
    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText('Slow')).toBeInTheDocument();
  });

  it('celebrates a perfect round and can restart', async () => {
    const onPlayAgain = vi.fn();
    render(
      <SessionReport
        {...baseProps}
        results={Object.fromEntries(baseProps.items.map((w) => [w, { missedFirstTry: false, timeMs: 1000, points: 15 }]))}
        onPlayAgain={onPlayAgain}
      />,
    );
    expect(screen.getByText('Perfect round!')).toBeInTheDocument();
    expect(screen.getByText('All heart words!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /play again/i }));
    expect(onPlayAgain).toHaveBeenCalledOnce();
  });
});
