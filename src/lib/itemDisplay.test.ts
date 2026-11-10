import { describe, expect, it } from 'vitest';
import { describeFact, describeItem, describeLetter, describeWord } from './itemDisplay';

describe('item display', () => {
  it('shows letters as upper+lower case with an uppercase tag', () => {
    expect(describeLetter('b')).toMatchObject({ label: 'Bb', tag: 'B' });
    expect(describeLetter('b').icon).not.toBe('');
  });

  it('shows words exactly as written (no uppercasing "the" to "THE")', () => {
    expect(describeWord('the')).toMatchObject({ label: 'the', tag: 'the' });
    expect(describeWord('I')).toMatchObject({ label: 'I', tag: 'I' });
  });

  it('shows math facts with their answer and a short tag', () => {
    expect(describeFact('7-2')).toEqual({ icon: '➖', label: '7 − 2 = 5', tag: '7 − 2' });
    expect(describeFact('3+4')).toMatchObject({ icon: '➕', label: '3 + 4 = 7' });
  });

  it('picks the display style from the game id', () => {
    expect(describeItem('sight-words', 'and').label).toBe('and');
    expect(describeItem('letter-sounds', 'a').label).toBe('Aa');
    expect(describeItem('math-blasters', '3+4').label).toBe('3 + 4 = 7');
  });
});
