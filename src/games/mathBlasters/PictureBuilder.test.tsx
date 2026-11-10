import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseFact } from '../../data/mathFacts';
import { PictureBuilder } from './PictureBuilder';

const pictures = (name: RegExp = /picture/) => screen.queryAllByRole('button', { name });

describe('PictureBuilder', () => {
  it('starts empty and never shows a running count: the child builds and counts', () => {
    render(<PictureBuilder fact={parseFact('3+4')!} emoji="🍎" />);
    expect(pictures(/tap to remove/)).toHaveLength(0);
    expect(screen.getByText('Make 3')).toBeInTheDocument();
    expect(screen.getByText('Make 4')).toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
  });

  it('adding: each press makes one picture appear in that group; tapping one removes it', async () => {
    render(<PictureBuilder fact={parseFact('2+1')!} emoji="🍎" />);
    const addFirst = screen.getByRole('button', { name: 'Add a picture to group 1' });
    const addSecond = screen.getByRole('button', { name: 'Add a picture to group 2' });
    await userEvent.click(addFirst);
    await userEvent.click(addFirst);
    await userEvent.click(addFirst);
    await userEvent.click(addSecond);
    const [g1, g2] = [screen.getByLabelText('group 1'), screen.getByLabelText('group 2')];
    expect(within(g1).getAllByRole('button')).toHaveLength(3);
    expect(within(g2).getAllByRole('button')).toHaveLength(1);

    await userEvent.click(within(g1).getAllByRole('button')[0]); // oops, one too many
    expect(within(g1).getAllByRole('button')).toHaveLength(2);
  });

  it('subtracting: make the pictures, then cross them out one press at a time', async () => {
    render(<PictureBuilder fact={parseFact('4-2')!} emoji="🍎" />);
    expect(screen.getByText('Make 4, then subtract 2')).toBeInTheDocument();
    const subtract = screen.getByRole('button', { name: 'Subtract a picture' });
    expect(subtract).toBeDisabled(); // nothing to subtract yet

    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole('button', { name: 'Add a picture' }));
    await userEvent.click(subtract);
    await userEvent.click(subtract);
    expect(pictures(/crossed out/)).toHaveLength(2);
    expect(pictures(/tap to remove/)).toHaveLength(2);

    await userEvent.click(pictures(/crossed out/)[0]); // bring one back
    expect(pictures(/crossed out/)).toHaveLength(1);
  });

  it('start over clears everything', async () => {
    render(<PictureBuilder fact={parseFact('2+2')!} emoji="🍎" />);
    await userEvent.click(screen.getByRole('button', { name: 'Add a picture to group 1' }));
    await userEvent.click(screen.getByRole('button', { name: /Start over/ }));
    expect(pictures(/tap to remove/)).toHaveLength(0);
  });
});
