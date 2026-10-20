import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvadersMode } from './InvadersMode';
import { fakeSpeech } from '../../test/fakeSpeech';
import { SIGHT_WORDS } from '../../data/sightWords';
import { callOut } from './rounds';

async function startGame() {
  const { speech, speak } = fakeSpeech();
  render(<InvadersMode speech={speech} />);
  // The round starts by calling out the target word: "the. Pet the dog. the."
  await waitFor(() => expect(speak).toHaveBeenCalled());
  const target = speak.mock.calls[0][0].split('.')[0];
  const invaders = screen.getAllByRole('button', { name: /^word / });
  const wrong = invaders.filter((b) => b.textContent?.replace('👾', '') !== target);
  const right = invaders.find((b) => b.textContent?.replace('👾', '') === target)!;
  return { speak, target, invaders, wrong, right };
}

describe('Word Invaders gameplay', () => {
  it('starts on wave 1 with four invaders including the spoken word', async () => {
    const { invaders, right } = await startGame();
    expect(screen.getByText('Wave 1 of 18')).toBeInTheDocument();
    expect(invaders).toHaveLength(4);
    expect(right).toBeDefined();
  });

  it('calls out the word, a sentence with it, then the word again', async () => {
    const { speak, target } = await startGame();
    const { sentence } = SIGHT_WORDS.find((w) => w.word === target)!;
    expect(speak.mock.calls[0][0]).toBe(callOut(target, sentence));
  });

  it('a wrong hit says what that word actually is and scores nothing', async () => {
    const { wrong, speak, target } = await startGame();
    const wrongWord = wrong[0].textContent!.replace('👾', '');
    await userEvent.click(wrong[0]);
    expect(screen.getByText(`That one says "${wrongWord}". Try again! 👂`)).toBeInTheDocument();
    expect(speak).toHaveBeenCalledWith(`That says ${wrongWord}. Find ${target}.`, expect.anything());
    expect(screen.getByText('⭐ 0 pts')).toBeInTheDocument();
  });

  it('highlights the right invader after two misses', async () => {
    const { wrong, right } = await startGame();
    await userEvent.click(wrong[0]);
    expect(right).not.toHaveClass('hint');
    await userEvent.click(wrong[1]);
    expect(right).toHaveClass('hint');
  });

  it('a direct hit scores points and moves on to the next wave', async () => {
    const { right } = await startGame();
    await userEvent.click(right);
    expect(right).toHaveClass('hit');
    expect(screen.queryByText('⭐ 0 pts')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Wave 2 of 18')).toBeInTheDocument(), { timeout: 2000 });
    expect(within(screen.getByText('Wave 2 of 18').parentElement!).getByText(/pts/)).toBeInTheDocument();
  });
});
