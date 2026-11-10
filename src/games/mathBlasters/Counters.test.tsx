import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { parseFact } from '../../data/mathFacts';
import { Counters } from './Counters';

const pictures = () => screen.getAllByRole('button', { name: /^(picture|counted \d+|crossed out)$/ });

describe('Counters', () => {
  it('starts with nothing counted or crossed out: the child does the work', () => {
    render(<Counters fact={parseFact('7-2')!} emoji="🍎" />);
    expect(pictures()).toHaveLength(7);
    expect(screen.queryAllByRole('button', { name: /counted|crossed/ })).toHaveLength(0);
    expect(screen.getByText('Subtract 2: tap to cross out 2 ✖')).toBeInTheDocument();
  });

  it('adding: each tap counts the next picture, and only what the child tapped', async () => {
    const onCount = vi.fn();
    render(<Counters fact={parseFact('2+1')!} emoji="🍎" onCount={onCount} />);
    const [p1, p2, p3] = pictures();
    await userEvent.click(p3);
    await userEvent.click(p1);
    expect(p3).toHaveAccessibleName('counted 1');
    expect(p1).toHaveAccessibleName('counted 2');
    expect(p2).toHaveAccessibleName('picture');
    await userEvent.click(p1); // tapping one twice doesn't count it twice
    expect(onCount.mock.calls).toEqual([[1], [2]]);
    await userEvent.click(p2);
    expect(onCount).toHaveBeenLastCalledWith(3);
    expect(screen.getByText(/You counted them all!/)).toBeInTheDocument();
  });

  it('subtracting: cross out first (undoable), then count what is left', async () => {
    const onCount = vi.fn();
    render(<Counters fact={parseFact('4-2')!} emoji="🍎" onCount={onCount} />);
    const [p1, p2, p3, p4] = pictures();
    await userEvent.click(p1);
    await userEvent.click(p1); // undo a slip
    expect(p1).toHaveAccessibleName('picture');
    await userEvent.click(p3);
    expect(screen.getByText('Cross out 1 more ✖')).toBeInTheDocument();
    await userEvent.click(p4);
    expect(onCount).not.toHaveBeenCalled();
    expect(screen.getByText(/Now tap to count the ones left/)).toBeInTheDocument();

    await userEvent.click(p4); // crossed-out pictures uncross, they don't count
    expect(p4).toHaveAccessibleName('picture');
    await userEvent.click(p4);
    await userEvent.click(p1);
    await userEvent.click(p2);
    await userEvent.click(p3); // crossed out: ignored once counting has started
    expect(onCount.mock.calls).toEqual([[1], [2]]);
    expect(p3).toHaveAccessibleName('crossed out');
  });

  it('start over clears everything', async () => {
    render(<Counters fact={parseFact('2+2')!} emoji="🍎" />);
    await userEvent.click(pictures()[0]);
    await userEvent.click(screen.getByRole('button', { name: /Start over/ }));
    expect(screen.queryAllByRole('button', { name: /counted/ })).toHaveLength(0);
  });
});
