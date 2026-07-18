import { format, parseISO, isToday, isSameDay } from 'date-fns';

/**
 * Returns a YYYY-MM-DD date using the device's local calendar.
 *
 * Do not use `toISOString().slice(0, 10)` for calendar-day data: ISO strings
 * are UTC-based and can assign late-night or shortly-after-midnight activity
 * to the wrong day in the user's time zone.
 */
export function localDateISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return localDateISO();
}

export function formatShortDate(iso: string): string {
  try {
    return format(parseISO(iso), 'EEE d');
  } catch {
    return iso;
  }
}

export function formatLongDate(iso: string): string {
  try {
    return format(parseISO(iso), 'EEEE, d MMMM');
  } catch {
    return iso;
  }
}

export function formatMonthDay(iso: string): string {
  try {
    return format(parseISO(iso), 'd MMM');
  } catch {
    return iso;
  }
}

export function isTodayISO(iso: string): boolean {
  try {
    return isToday(parseISO(iso));
  } catch {
    return false;
  }
}

export function sameDay(a: string, b: string): boolean {
  try {
    return isSameDay(parseISO(a), parseISO(b));
  } catch {
    return a === b;
  }
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Hello';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Hello';
}

export function difficultyLabel(d: 'gentle' | 'moderate' | 'focused'): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export function impactLabel(i: 'high' | 'moderate' | 'small'): string {
  if (i === 'high') return 'High impact';
  if (i === 'moderate') return 'Moderate impact';
  return 'Smaller impact';
}
