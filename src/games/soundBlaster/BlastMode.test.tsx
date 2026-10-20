import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlastMode } from './BlastMode';
import { fakeSpeech } from '../../test/fakeSpeech';
import { soundsFor } from './rounds';

const tiles = () => screen.getAllByRole('button', { name: /^Sound \d: letter / });
const pictures = () => screen.getAllByRole('button', { name: /^picture / });
const currentWord = () => tiles().map((t) => t.textContent).join('');

async function soundOutWord() {
  const { speech, speak } = fakeSpeech();
  render(<BlastMode speech={speech} />);
  const word = currentWord();
  for (const tile of tiles()) await userEvent.click(tile);
  const right = pictures().find((b) => b.getAttribute('aria-label') === `picture ${word}`)!;
  const wrong = pictures().filter((b) => b !== right);
  return { speak, word, right, wrong };
}

describe('Sound Blaster gameplay', () => {
  it('lights letters left to right, saying each sound', async () => {
    const { speech, speak } = fakeSpeech();
    render(<BlastMode speech={speech} />);
    expect(screen.getByText('Word 1 of 10')).toBeInTheDocument();
    const [first, second, third] = tiles();
    expect(third).toBeDisabled();
    expect(screen.queryAllByRole('button', { name: /^picture / })).toHaveLength(0);

    await userEvent.click(first);
    expect(first).toHaveClass('lit');
    expect(speak).toHaveBeenLastCalledWith(soundsFor(currentWord())[0], expect.anything());
    expect(second).toHaveClass('next');
  });

  it('shows the pictures only once every letter is sounded', async () => {
    const { right, wrong } = await soundOutWord();
    expect(pictures()).toHaveLength(3);
    expect(right).toBeDefined();
    expect(wrong).toHaveLength(2);
  });

  it('a wrong picture says what it is and scores nothing', async () => {
    const { wrong, speak } = await soundOutWord();
    const wrongWord = wrong[0].getAttribute('aria-label')!.replace('picture ', '');
    await userEvent.click(wrong[0]);
    expect(screen.getByText(`That's a ${wrongWord}. Sound it out again! 👆`)).toBeInTheDocument();
    expect(speak).toHaveBeenLastCalledWith(`That's a ${wrongWord}. Sound it out again.`, expect.anything());
    expect(screen.getByText('⭐ 0 pts')).toBeInTheDocument();
  });

  it('highlights the right picture after two misses', async () => {
    const { wrong, right } = await soundOutWord();
    await userEvent.click(wrong[0]);
    expect(right).not.toHaveClass('hint');
    await userEvent.click(wrong[1]);
    expect(right).toHaveClass('hint');
  });

  it('the right picture blends the word, scores, and moves on', async () => {
    const { right, word, speak } = await soundOutWord();
    await userEvent.click(right);
    expect(right).toHaveClass('right');
    expect(speak).toHaveBeenLastCalledWith(`${soundsFor(word).join(', ')}. ${word}!`, expect.anything());
    expect(screen.queryByText('⭐ 0 pts')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Word 2 of 10')).toBeInTheDocument(), { timeout: 2000 });
    expect(tiles()[0]).toHaveClass('next');
  });
});
