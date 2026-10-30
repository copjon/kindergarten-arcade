import { describe, expect, it } from 'vitest';
import { FIRST_TRY_POINTS, MAX_SPEED_BONUS, RETRY_POINTS, pointsFor, timeBonusFor } from './scoring';

describe('timeBonusFor', () => {
  it.each([
    [0, MAX_SPEED_BONUS],
    [3000, MAX_SPEED_BONUS],
    [3001, 3],
    [6000, 3],
    [6001, 1],
    [10000, 1],
    [10001, 0],
    [60000, 0],
  ])('%i ms earns %i bonus points', (ms, expected) => {
    expect(timeBonusFor(ms)).toBe(expected);
  });
});

describe('pointsFor', () => {
  it('gives full points plus speed bonus for a fast first try', () => {
    expect(pointsFor(false, 1000)).toBe(FIRST_TRY_POINTS + MAX_SPEED_BONUS);
  });

  it('gives flat retry points after a miss, with no speed bonus', () => {
    expect(pointsFor(true, 1000)).toBe(RETRY_POINTS);
    expect(pointsFor(true, 20000)).toBe(RETRY_POINTS);
  });

  it('never lets a fast guess-and-retry match a slow first try', () => {
    expect(pointsFor(true, 500)).toBeLessThan(pointsFor(false, 60000));
  });

  it('always rewards a correct answer more on the first try than after a miss', () => {
    for (const ms of [500, 4000, 8000, 30000]) {
      expect(pointsFor(false, ms)).toBeGreaterThan(pointsFor(true, ms));
    }
  });
});
