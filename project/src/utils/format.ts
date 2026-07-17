import { format, parseISO, isToday, isSameDay } from 'date-fns';

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
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
