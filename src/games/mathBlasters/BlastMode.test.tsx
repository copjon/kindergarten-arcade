import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlastMode } from './BlastMode';
import { fakeSpeech } from '../../test/fakeSpeech';

/** Reads the problem off the screen, e.g. "7 − 2 = ?" → 5. */
function currentAnswer(): number {
  const text = document.querySelector('.math-problem')!.textContent!;
  const [, a, op, b] = /(\d+) ([+−]) (\d+)/.exec(text)!;
  return op === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
}

async function startGame() {
  const { speech, speak } = fakeSpeech();
  render(<BlastMode speech={speech} />);
  await waitFor(() => expect(speak).toHaveBeenCalled());
  const answer = currentAnswer();
  const ships = screen.getAllByRole('button', { name: /^answer / });
  const right = screen.getByRole('button', { name: `answer ${answer}` });
  const wrong = ships.filter((b) => b !== right);
  return { speak, answer, ships, right, wrong };
}

describe('Math Blasters gameplay', () => {
  it('asks the problem out loud and offers four answers including the right one', async () => {
    const { speak, ships } = await startGame();
    expect(screen.getByText('Problem 1 of 10')).toBeInTheDocument();
    expect(ships).toHaveLength(4);
    expect(speak.mock.calls[0][0]).toMatch(/^What is \d+ (plus|take away) \d+\?$/);
  });

  it('a wrong hit scores nothing and brings out pictures to count', async () => {
    const { wrong } = await startGame();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const n = wrong[0].textContent!.replace('🛸', '');
    await userEvent.click(wrong[0]);
    expect(screen.getByText(`Not ${n}. Count the pictures and try again! 👀`)).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('⭐ 0 pts')).toBeInTheDocument();
  });

  it('highlights the right answer after two misses', async () => {
    const { wrong, right } = await startGame();
    await userEvent.click(wrong[0]);
    expect(right).not.toHaveClass('hint');
    await userEvent.click(wrong[1]);
    expect(right).toHaveClass('hint');
  });

  it('a direct hit scores, says the whole fact, and moves on', async () => {
    const { right, speak, answer } = await startGame();
    await userEvent.click(right);
    expect(right).toHaveClass('hit');
    expect(speak).toHaveBeenCalledWith(expect.stringMatching(new RegExp(` is ${answer}!$`)), expect.anything());
    expect(screen.queryByText('⭐ 0 pts')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Problem 2 of 10')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('switching to adding only restarts with addition problems and remembers the choice', async () => {
    await startGame();
    await userEvent.click(screen.getByRole('button', { name: /Add/ }));
    expect(screen.getByRole('button', { name: /Add/ })).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('.math-problem')!.textContent).toContain('+');
    expect(localStorage.getItem('mathBlasters.ops')).toBe('add');
  });
});
