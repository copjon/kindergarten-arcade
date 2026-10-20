import { describe, expect, it } from 'vitest';
import { describeItem, describeLetter, describeWord } from './itemDisplay';

describe('item display', () => {
  it('shows letters as upper+lower case with an uppercase tag', () => {
    expect(describeLetter('b')).toMatchObject({ label: 'Bb', tag: 'B' });
    expect(describeLetter('b').icon).not.toBe('');
  });

  it('shows words exactly as written (no uppercasing "the" to "THE")', () => {
    expect(describeWord('the')).toMatchObject({ label: 'the', tag: 'the' });
    expect(describeWord('I')).toMatchObject({ label: 'I', tag: 'I' });
  });

  it('picks the display style from the game id', () => {
    expect(describeItem('sight-words', 'and').label).toBe('and');
    expect(describeItem('letter-sounds', 'a').label).toBe('Aa');
  });
});
