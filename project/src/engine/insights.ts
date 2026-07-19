import type {
  DaySummary,
  WeeklyReport,
  TriggerPattern,
  Achievement,
  EveningCheckIn,
  HabitLog,
  Habit,
  EnhancedWeeklyReport,
  MonthlyStory,
} from '../types';
import { MIN_DAYS_FOR_PATTERNS, MIN_DAYS_FOR_WEEKLY_REPORT } from '../config';
import { todayISO } from '../utils/format';

/**
 * Pattern detection over real stored history.
 * No sample or zero-occurrence patterns are returned before sufficient data.
 */
export function detectTriggers(history: DaySummary[]): TriggerPattern[] {
  if (history.length < MIN_DAYS_FOR_PATTERNS) return [];

  const patterns: TriggerPattern[] = [];
  const add = (
    id: string,
    label: string,
    type: TriggerPattern['type'],
    occurrences: number,
  ) => {
    if (occurrences > 0) {
      patterns.push({ id, label, type, occurrences, sample: false });
    }
  };

  add(
    'sleep_low',
    'Sleep below six hours',
    'negative',
    history.filter((day) => day.sleepHours !== undefined && day.sleepHours < 6).length,
  );
  add(
    'screen_bed',
    'High screen use before bed',
    'negative',
    history.filter((day) => day.screenMinutes !== undefined && day.screenMinutes >= 40).length,
  );
  add(
    'no_outdoor',
    'Very limited outdoor activity',
    'negative',
    history.filter((day) => day.outdoorMinutes !== undefined && day.outdoorMinutes < 10).length,
  );
  add(
    'high_stress_days',
    'Higher-stress days',
    'negative',
    history.filter((day) => day.stress >= 70).length,
  );
  add(
    'walking_outdoor',
    'Time spent outdoors',
    'positive',
    history.filter((day) => day.outdoorMinutes !== undefined && day.outdoorMinutes >= 15).length,
  );
  add(
    'regular_sleep',
    'Seven to nine hours of sleep',
    'positive',
    history.filter(
      (day) =>
        day.sleepHours !== undefined && day.sleepHours >= 7 && day.sleepHours <= 9,
    ).length,
  );
  add(
    'hydration_goals',
    'Meeting hydration goals',
    'positive',
    history.filter((day) => day.waterGlasses !== undefined && day.waterGlasses >= 5).length,
  );

  return patterns;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function definedValues(
  days: DaySummary[],
  select: (day: DaySummary) => number | undefined,
): number[] {
  return days
    .map(select)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
}

export function buildWeeklyReport(history: DaySummary[]): WeeklyReport | null {
  if (history.length < MIN_DAYS_FOR_WEEKLY_REPORT) return null;

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const previousScore = first.overall;
  const changePercent =
    previousScore === 0
      ? 0
      : Math.round(((last.overall - previousScore) / previousScore) * 100);

  const splitAt = Math.ceil(recent.length / 2);
  const firstHalf = recent.slice(0, splitAt);
  const secondHalf = recent.slice(splitAt);
  const improvements: string[] = [];

  const firstSleepValues = definedValues(firstHalf, (day) => day.sleepHours);
  const secondSleepValues = definedValues(secondHalf, (day) => day.sleepHours);
  if (firstSleepValues.length >= 2 && secondSleepValues.length >= 2) {
    const firstSleep = average(firstSleepValues);
    const secondSleep = average(secondSleepValues);
    if (firstSleep !== null && secondSleep !== null && secondSleep - firstSleep > 0.3) {
      improvements.push(`Average sleep increased by ${(secondSleep - firstSleep).toFixed(1)} hours`);
    }
  }

  const firstScreenValues = definedValues(firstHalf, (day) => day.screenMinutes);
  const secondScreenValues = definedValues(secondHalf, (day) => day.screenMinutes);
  if (firstScreenValues.length >= 2 && secondScreenValues.length >= 2) {
    const firstScreen = average(firstScreenValues);
    const secondScreen = average(secondScreenValues);
    if (
      firstScreen !== null &&
      secondScreen !== null &&
      firstScreen > 0 &&
      firstScreen - secondScreen > 5
    ) {
      improvements.push(
        `Screen time decreased by ${Math.round(((firstScreen - secondScreen) / firstScreen) * 100)}%`,
      );
    }
  }

  const outdoorDays = recent.filter(
    (day) => day.outdoorMinutes !== undefined && day.outdoorMinutes >= 15,
  ).length;
  if (outdoorDays >= 2) {
    improvements.push(`${outdoorDays} outdoor days recorded`);
  }

  const firstStress = average(firstHalf.map((day) => day.stress));
  const secondStress = average(secondHalf.map((day) => day.stress));
  if (
    firstStress !== null &&
    secondStress !== null &&
    firstStress - secondStress > 5
  ) {
    improvements.push(
      `Stress shifted from ${Math.round(firstStress / 10)}/10 to ${Math.round(secondStress / 10)}/10`,
    );
  }

  if (improvements.length === 0) {
    improvements.push(`You completed ${recent.length} real check-ins in this reflection period`);
  }

  let challenge = 'Keep gathering data to surface a main challenge.';
  const challenges: { name: string; occurrences: number }[] = [];

  const shortSleepDays = recent.filter(
    (day) => day.sleepHours !== undefined && day.sleepHours < 6,
  ).length;
  if (shortSleepDays > 0) {
    challenges.push({ name: 'sleep schedule', occurrences: shortSleepDays });
  }

  const higherStressDays = recent.filter((day) => day.stress >= 65).length;
  if (higherStressDays > 0) {
    challenges.push({ name: 'stress', occurrences: higherStressDays });
  }

  const lowActivityDays = recent.filter(
    (day) => day.activeMinutes !== undefined && day.activeMinutes < 20,
  ).length;
  if (lowActivityDays > 0) {
    challenges.push({ name: 'physical activity', occurrences: lowActivityDays });
  }

  challenges.sort((a, b) => b.occurrences - a.occurrences);
  if (challenges[0]) {
    challenge = `Your ${challenges[0].name} appears to be the most repeated area worth monitoring.`;
  }

  let recommendation = 'Continue your current rhythm and check in again tomorrow.';
  if (challenge.includes('sleep')) {
    recommendation = 'Try a gentle wind-down 30 minutes before bed for the next few nights.';
  } else if (challenge.includes('stress')) {
    recommendation = 'Consider a short breathing pause when stress rises, and protect a small recovery window each day.';
  } else if (challenge.includes('activity')) {
    recommendation = 'A brief outdoor walk a few times this week could gently lift energy.';
  }

  return {
    weekStart: first.date,
    weekEnd: last.date,
    currentScore: last.overall,
    previousScore,
    changePercent,
    improvements,
    challenge,
    recommendation,
    topFactor: improvements[0],
  };
}

/**
 * Wraps `buildWeeklyReport` with a more personal, human-readable layer that
 * draws on habit logs and evening "what helped" data. Returns null under the
 * same real-data threshold as the base report.
 */
export function buildEnhancedWeeklyReport(
  history: DaySummary[],
  eveningCheckIns: EveningCheckIn[],
  habitLogs: HabitLog[],
  habits: Habit[],
): EnhancedWeeklyReport | null {
  const base = buildWeeklyReport(history);
  if (!base) return null;

  const recentDates = new Set(
    [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((d) => d.date),
  );

  // Helpful-activity tally from evening check-ins within the window.
  const helpfulTally = new Map<string, number>();
  eveningCheckIns
    .filter((e) => recentDates.has(e.date))
    .forEach((e) => {
      e.whatHelped.forEach((item) => {
        const key = item.trim();
        if (!key) return;
        helpfulTally.set(key, (helpfulTally.get(key) ?? 0) + 1);
      });
    });
  const helpfulHabits = [...helpfulTally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  // Consistency: share of the 7 days with any logged activity (check-in,
  // habit log, or evening reflection).
  const activeHabitIds = new Set(habits.filter((h) => h.active).map((h) => h.id));
  let daysWithActivity = 0;
  recentDates.forEach((date) => {
    const hasCheckIn = history.some((d) => d.date === date);
    const hasHabit = habitLogs.some((l) => l.date === date && activeHabitIds.has(l.habitId) && l.completed);
    const hasEvening = eveningCheckIns.some((e) => e.date === date);
    if (hasCheckIn || hasHabit || hasEvening) daysWithActivity += 1;
  });
  const consistency = Math.round((daysWithActivity / Math.max(1, recentDates.size)) * 100);

  const nextWeekSuggestion = base.challenge.includes('sleep')
    ? 'Next week, try anchoring a consistent bedtime rather than changing everything at once.'
    : base.challenge.includes('stress')
      ? 'Next week, protect one short recovery break each day before stress builds up.'
      : base.challenge.includes('activity')
        ? 'Next week, aim for a short walk on just two or three days rather than every day.'
        : 'Next week, keep the same gentle rhythm — consistency matters more than intensity.';

  return {
    ...base,
    strongestImprovement: base.improvements[0] ?? 'Steady real check-ins this week.',
    biggestChallenge: base.challenge,
    helpfulHabits,
    consistency,
    nextWeekSuggestion,
  };
}

/**
 * Builds a monthly wellness story. Gated behind a real-data threshold so
 * empty or sparse months never fabricate highlights.
 */
export function buildMonthlyStory(history: DaySummary[], habitLogs: HabitLog[], habits: Habit[], month: string): MonthlyStory {
  const monthDays = history.filter((d) => d.date.startsWith(month));
  const MIN_DAYS_FOR_MONTHLY_STORY = 10;

  if (monthDays.length < MIN_DAYS_FOR_MONTHLY_STORY) {
    return { month, hasEnoughData: false };
  }

  const sorted = [...monthDays].sort((a, b) => a.date.localeCompare(b.date));

  // Best week: highest average overall score across any 7-day window.
  let bestAvg = -1;
  let bestWeekStart = sorted[0].date;
  for (let i = 0; i < sorted.length; i += 1) {
    const window = sorted.slice(i, i + 7);
    if (window.length < 3) continue;
    const avg = average(window.map((d) => d.overall)) ?? 0;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestWeekStart = window[0].date;
    }
  }
  const bestWeekLabel = `Week of ${bestWeekStart}`;

  const firstHalf = sorted.slice(0, Math.ceil(sorted.length / 2));
  const secondHalf = sorted.slice(Math.ceil(sorted.length / 2));
  const firstAvg = average(firstHalf.map((d) => d.overall)) ?? 0;
  const secondAvg = average(secondHalf.map((d) => d.overall)) ?? 0;
  const topImprovement =
    secondAvg > firstAvg
      ? `Your overall wellness score rose from ${Math.round(firstAvg)} to ${Math.round(secondAvg)} through the month.`
      : 'Your overall wellness score held steady across the month.';

  // Strongest habit: highest completion rate among active habits with logs this month.
  const monthLogs = habitLogs.filter((l) => l.date.startsWith(month));
  let strongestHabit: string | undefined;
  let bestRate = -1;
  habits.forEach((h) => {
    const logsForHabit = monthLogs.filter((l) => l.habitId === h.id);
    if (logsForHabit.length < 4) return;
    const rate = logsForHabit.filter((l) => l.completed).length / logsForHabit.length;
    if (rate > bestRate) {
      bestRate = rate;
      strongestHabit = h.title;
    }
  });

  const stressDays = sorted.filter((d) => d.stress >= 65).length;
  const biggestChallenge =
    stressDays >= 4
      ? 'Stress was elevated on several days this month.'
      : sorted.some((d) => d.sleepHours !== undefined && d.sleepHours < 6)
        ? 'Short sleep nights came up more than once this month.'
        : 'No single area stood out — a fairly even month.';

  const totalMissionSlots = sorted.reduce((sum, d) => sum + d.missionsTotal, 0);
  const totalMissionsDone = sorted.reduce((sum, d) => sum + d.missionsCompleted, 0);
  const completionPercent = totalMissionSlots > 0 ? Math.round((totalMissionsDone / totalMissionSlots) * 100) : 0;

  const highlight =
    secondAvg - firstAvg > 5
      ? 'The clearest highlight this month was a steady upward trend in the back half.'
      : strongestHabit
        ? `"${strongestHabit}" was your most consistent habit this month.`
        : 'You showed up consistently to check in with yourself this month.';

  return {
    month,
    hasEnoughData: true,
    bestWeekLabel,
    topImprovement,
    strongestHabit,
    biggestChallenge,
    completionPercent,
    highlight,
  };
}

const ACHIEVEMENT_DEFS: Omit<Achievement, 'earned' | 'earnedDate' | 'progress'>[] = [
  { id: 'sleep_consistency_7', name: 'Seven-Day Sleep Consistency', description: '7+ hours of sleep for seven days', icon: 'MoonStar' },
  { id: 'hydration_week', name: 'Hydration Week', description: 'Met hydration goals for seven days', icon: 'GlassWater' },
  { id: 'active_week', name: 'Active Week', description: 'Moved your body on seven days', icon: 'Dumbbell' },
  { id: 'screen_reduction', name: 'Screen-Time Reduction', description: 'Kept pre-sleep screen use low over a week', icon: 'MoonOff' },
  { id: 'outdoor_streak', name: 'Outdoor Streak', description: 'Spent time outdoors on five days', icon: 'TreePine' },
  { id: 'mission_consistency', name: 'Mission Consistency', description: 'Completed all missions on seven days', icon: 'CheckCircle' },
  { id: 'balanced_week', name: 'Balanced Week', description: 'Maintained a wellness score of 70+ for a week', icon: 'Scale' },
];

export function evaluateAchievements(
  history: DaySummary[],
  existing: Achievement[] = [],
): Achievement[] {
  if (history.length === 0) return [];

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sorted.slice(-7);
  const last5 = sorted.slice(-5);
  const count = (days: DaySummary[], matches: (day: DaySummary) => boolean) =>
    days.filter(matches).length;

  const sleepCount = count(last7, (day) => day.sleepHours !== undefined && day.sleepHours >= 7);
  const hydrationCount = count(last7, (day) => day.waterGlasses !== undefined && day.waterGlasses >= 5);
  const activeCount = count(last7, (day) => day.activeMinutes !== undefined && day.activeMinutes >= 15);
  const screenCount = count(last7, (day) => day.screenMinutes !== undefined && day.screenMinutes <= 20);
  const outdoorCount = count(last5, (day) => day.outdoorMinutes !== undefined && day.outdoorMinutes >= 15);
  const missionCount = count(
    last7,
    (day) => day.missionsTotal > 0 && day.missionsCompleted === day.missionsTotal,
  );
  const balancedCount = count(last7, (day) => day.overall >= 70);

  const checks: Record<string, { earned: boolean; progress: number }> = {
    sleep_consistency_7: { earned: sleepCount >= 7, progress: Math.min(100, Math.round((sleepCount / 7) * 100)) },
    hydration_week: { earned: hydrationCount >= 7, progress: Math.min(100, Math.round((hydrationCount / 7) * 100)) },
    active_week: { earned: activeCount >= 7, progress: Math.min(100, Math.round((activeCount / 7) * 100)) },
    screen_reduction: { earned: screenCount >= 6, progress: Math.min(100, Math.round((screenCount / 6) * 100)) },
    outdoor_streak: { earned: outdoorCount >= 5, progress: Math.min(100, Math.round((outdoorCount / 5) * 100)) },
    mission_consistency: { earned: missionCount >= 7, progress: Math.min(100, Math.round((missionCount / 7) * 100)) },
    balanced_week: { earned: balancedCount >= 7, progress: Math.min(100, Math.round((balancedCount / 7) * 100)) },
  };

  return ACHIEVEMENT_DEFS.map((definition) => {
    const check = checks[definition.id];
    const previous = existing.find((achievement) => achievement.id === definition.id);
    return {
      ...definition,
      earned: check.earned,
      progress: check.progress,
      earnedDate: check.earned ? previous?.earnedDate ?? todayISO() : undefined,
    };
  });
}
