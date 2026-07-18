import { differenceInCalendarDays, parseISO } from 'date-fns';

/**
 * Computes the next streak value for a newly-counted check-in.
 *
 * Rules:
 * - The very first counted check-in starts the streak at 1.
 * - If the last counted day was yesterday, the streak continues (+1).
 * - If the last counted day was today, nothing changes (caller should not
 *   invoke this for a same-day repeat check-in — see shouldCountTowardStreak).
 * - If more than one day was missed, the streak resets to 1.
 */
export function computeNextStreak(
  currentStreak: number,
  lastCountedDate: string | null,
  todayDate: string,
): number {
  if (!lastCountedDate) return 1;
  if (lastCountedDate === todayDate) return currentStreak;

  const daysSince = differenceInCalendarDays(parseISO(todayDate), parseISO(lastCountedDate));

  if (daysSince === 1) return currentStreak + 1;
  return 1;
}

/** A calendar day only counts once toward the streak, no matter how many times the user checks in. */
export function shouldCountTowardStreak(lastCountedDate: string | null, todayDate: string): boolean {
  return lastCountedDate !== todayDate;
}
