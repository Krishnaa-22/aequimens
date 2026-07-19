import type {
  BestStateProfile,
  CheckInResult,
  DaySummary,
  PersonalGoal,
  SimilarDayInsight,
} from '../types';
import { formatShortDate } from '../utils/format';

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildBestStateProfile(history: DaySummary[]): BestStateProfile | null {
  if (history.length < 14) return null;

  const sorted = [...history].sort((a, b) => b.overall - a.overall);
  const bestDays = sorted.slice(0, Math.max(4, Math.ceil(sorted.length * 0.3)));
  const conditions: string[] = [];
  const ratio = (test: (day: DaySummary) => boolean) => bestDays.filter(test).length / bestDays.length;

  if (ratio((day) => day.sleepHours !== undefined && day.sleepHours >= 7) >= 0.6) {
    conditions.push('you sleep for at least seven hours');
  }
  if (ratio((day) => day.screenMinutes !== undefined && day.screenMinutes <= 30) >= 0.6) {
    conditions.push('pre-sleep screen use stays lower');
  }
  if (ratio((day) => day.outdoorMinutes !== undefined && day.outdoorMinutes >= 15) >= 0.6) {
    conditions.push('you spend at least fifteen minutes outdoors');
  }
  if (ratio((day) => day.activeMinutes !== undefined && day.activeMinutes >= 20) >= 0.6) {
    conditions.push('you include some physical movement');
  }
  if (ratio((day) => day.waterGlasses !== undefined && day.waterGlasses >= 5) >= 0.6) {
    conditions.push('your hydration is more consistent');
  }
  if (ratio((day) => day.stress <= 55) >= 0.6) {
    conditions.push('your stress load stays moderate');
  }

  if (conditions.length === 0) {
    conditions.push('your routine is more consistent across sleep, movement, and recovery');
  }

  return { conditions: conditions.slice(0, 4), sampleSize: bestDays.length };
}

export function findSimilarDay(history: DaySummary[], today: DaySummary | null): SimilarDayInsight | null {
  if (!today || history.length < 7) return null;
  const previous = history.filter((day) => day.date !== today.date);
  if (previous.length === 0) return null;

  const distance = (day: DaySummary) => {
    const parts = [
      day.mood - today.mood,
      day.energy - today.energy,
      day.stress - today.stress,
      day.sleep - today.sleep,
      day.motivation - today.motivation,
    ];
    return Math.sqrt(parts.reduce((sum, value) => sum + value * value, 0));
  };

  const closest = [...previous].sort((a, b) => distance(a) - distance(b))[0];
  const similarity = Math.max(0, Math.round(100 - distance(closest) * 0.8));
  const positiveParts: string[] = [];
  if (closest.sleepHours !== undefined && closest.sleepHours >= 7) positiveParts.push('steady sleep');
  if (closest.outdoorMinutes !== undefined && closest.outdoorMinutes >= 15) positiveParts.push('outdoor time');
  if (closest.activeMinutes !== undefined && closest.activeMinutes >= 20) positiveParts.push('movement');
  if (closest.missionsTotal > 0 && closest.missionsCompleted === closest.missionsTotal) positiveParts.push('finishing your plan');

  const support = positiveParts[0]
    ? `${positiveParts[0]} was one supportive part of that day.`
    : 'Keep tracking today so Aequimens can learn what changes the outcome.';

  return {
    date: closest.date,
    similarity,
    summary: `Today looks similar to ${formatShortDate(closest.date)}. ${support}`,
  };
}

export function buildTodayFocus(
  checkIn: CheckInResult | null,
  goals: PersonalGoal[],
): { title: string; detail: string; icon: string } {
  const contributor = checkIn?.contributors.find(
    (item) => item.direction === 'negative' && item.impact === 'high',
  ) ?? checkIn?.contributors.find((item) => item.direction === 'negative');

  if (contributor) {
    const titleByCategory: Record<string, string> = {
      sleep: 'Protect your recovery',
      stress: 'Create a little breathing room',
      energy: 'Rebuild your energy gently',
      hydration: 'Support your energy with hydration',
      activity: 'Bring in a little movement',
      screen: 'Give your attention a softer landing',
      outdoor: 'Step outside for a reset',
      social: 'Reconnect with someone safe',
      meals: 'Return to a steadier rhythm',
      routine: 'Simplify today’s routine',
      motivation: 'Make the next step smaller',
      mood: 'Treat today with more softness',
    };
    return {
      title: titleByCategory[contributor.category] ?? 'Support your balance today',
      detail: contributor.detail,
      icon: contributor.category === 'sleep' ? 'MoonStar' : contributor.category === 'stress' ? 'Wind' : 'Compass',
    };
  }

  const activeGoal = goals.find((goal) => goal.active);
  if (activeGoal) {
    return {
      title: activeGoal.title,
      detail: `Your current personal goal is “${activeGoal.target}”. Keep today’s step small and realistic.`,
      icon: 'Target',
    };
  }

  return {
    title: 'Map how today feels',
    detail: 'A short check-in will help Aequimens choose one clear focus for the rest of your day.',
    icon: 'Sparkles',
  };
}

export function goalProgress(goal: PersonalGoal, history: DaySummary[]): number {
  if (history.length === 0) return 0;
  const recent = history.slice(-Math.min(history.length, goal.timeframeWeeks * 7));
  const tests: Record<string, (day: DaySummary) => boolean> = {
    sleep: (day) => (day.sleepHours ?? 0) >= 7,
    stress: (day) => day.stress <= 55,
    energy: (day) => day.energy >= 65,
    screen: (day) => (day.screenMinutes ?? 999) <= 30,
    activity: (day) => (day.activeMinutes ?? 0) >= 20,
    hydration: (day) => (day.waterGlasses ?? 0) >= 5,
    outdoor: (day) => (day.outdoorMinutes ?? 0) >= 15,
    routine: (day) => day.missionsTotal > 0 && day.missionsCompleted / day.missionsTotal >= 0.66,
    social: (day) => day.mood >= 65,
    custom: (day) => day.overall >= 70,
  };
  const successful = recent.filter(tests[goal.category] ?? tests.custom).length;
  return Math.round((successful / recent.length) * 100);
}

export function averageWellness(history: DaySummary[]): number | null {
  if (history.length === 0) return null;
  return Math.round(average(history.map((day) => day.overall)));
}
