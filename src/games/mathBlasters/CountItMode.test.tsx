import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountItMode } from './CountItMode';
import { fakeSpeech } from '../../test/fakeSpeech';

describe('Count It', () => {
  it('never says or shows the answer until the child picks it', async () => {
    const { speech, speak } = fakeSpeech();
    render(<CountItMode speech={speech} />);
    // Starts on 3 + 2.
    expect(screen.queryByRole('button', { name: /Count with me|Say it|Show the answer/ })).not.toBeInTheDocument();
    expect(document.querySelector('.count-answer')).toHaveTextContent('?');

    await userEvent.click(screen.getByRole('button', { name: 'answer 4' }));
    expect(screen.getByText('Not 4. Count the pictures again! 👀')).toBeInTheDocument();
    expect(document.querySelector('.count-answer')).toHaveTextContent('?');
    expect(speak.mock.calls.flat().join(' ')).not.toMatch(/\b5\b/);

    await userEvent.click(screen.getByRole('button', { name: 'answer 5' }));
    expect(document.querySelector('.count-answer')).toHaveTextContent('5');
    expect(speak).toHaveBeenLastCalledWith('Yes! 3 plus 2 is 5!', expect.anything());
  });

  it('switches to subtracting', async () => {
    const { speech } = fakeSpeech();
    render(<CountItMode speech={speech} />);
    await userEvent.click(screen.getByRole('button', { name: /Subtract/ }));
    expect(screen.getByText('Subtract 2: tap to cross out 2 ✖')).toBeInTheDocument();
  });
});
