export const FIRST_TRY_POINTS = 10;
export const RETRY_POINTS = 5;
export const MAX_SPEED_BONUS = 5;

export function timeBonusFor(ms: number): number {
  if (ms <= 3000) return MAX_SPEED_BONUS;
  if (ms <= 6000) return 3;
  if (ms <= 10000) return 1;
  return 0;
}

// The speed bonus only counts on a first try, so tapping fast and fixing it after never pays.
export function pointsFor(missedFirstTry: boolean, ms: number): number {
  return missedFirstTry ? RETRY_POINTS : FIRST_TRY_POINTS + timeBonusFor(ms);
}
