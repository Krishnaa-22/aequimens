import type { DaySummary, WeeklyReport, TriggerPattern, Achievement } from '../types';

/**
 * Pattern detection over recent history.
 * Correlations are presented as early sample insights until enough data exists.
 */

export function detectTriggers(history: DaySummary[]): TriggerPattern[] {
  if (history.length < 3) {
    return [
      { id: 'sleep_low', label: 'Sleep below six hours', type: 'negative', occurrences: 0, sample: true },
      { id: 'screen_bed', label: 'High screen use before bed', type: 'negative', occurrences: 0, sample: true },
      { id: 'no_outdoor', label: 'No outdoor activity', type: 'negative', occurrences: 0, sample: true },
      { id: 'high_stress_days', label: 'Multiple high-stress days', type: 'negative', occurrences: 0, sample: true },
      { id: 'walking_outdoor', label: 'Walking outdoors', type: 'positive', occurrences: 0, sample: true },
      { id: 'regular_sleep', label: 'Regular sleep', type: 'positive', occurrences: 0, sample: true },
      { id: 'social_interaction', label: 'Social interaction', type: 'positive', occurrences: 0, sample: true },
      { id: 'hydration_goals', label: 'Completing hydration goals', type: 'positive', occurrences: 0, sample: true },
    ];
  }

  const patterns: TriggerPattern[] = [];
  const sample = history.length < 7;

  const lowSleep = history.filter((d) => (d.sleepHours ?? 99) < 6).length;
  patterns.push({ id: 'sleep_low', label: 'Sleep below six hours', type: 'negative', occurrences: lowSleep, sample });

  const highScreen = history.filter((d) => (d.screenMinutes ?? 0) >= 40).length;
  patterns.push({ id: 'screen_bed', label: 'High screen use before bed', type: 'negative', occurrences: highScreen, sample });

  const noOutdoor = history.filter((d) => (d.outdoorMinutes ?? 0) < 10).length;
  patterns.push({ id: 'no_outdoor', label: 'No outdoor activity', type: 'negative', occurrences: noOutdoor, sample });

  const highStressDays = history.filter((d) => d.stress >= 70).length;
  patterns.push({ id: 'high_stress_days', label: 'Multiple high-stress days', type: 'negative', occurrences: highStressDays, sample });

  const outdoorWalks = history.filter((d) => (d.outdoorMinutes ?? 0) >= 15).length;
  patterns.push({ id: 'walking_outdoor', label: 'Walking outdoors', type: 'positive', occurrences: outdoorWalks, sample });

  const regularSleep = history.filter((d) => (d.sleepHours ?? 0) >= 7 && (d.sleepHours ?? 0) <= 9).length;
  patterns.push({ id: 'regular_sleep', label: 'Regular sleep', type: 'positive', occurrences: regularSleep, sample });

  const socialDays = history.filter((d) => d.mood >= 60).length;
  patterns.push({ id: 'social_interaction', label: 'Social interaction', type: 'positive', occurrences: socialDays, sample });

  const hydrationDays = history.filter((d) => (d.waterGlasses ?? 0) >= 5).length;
  patterns.push({ id: 'hydration_goals', label: 'Completing hydration goals', type: 'positive', occurrences: hydrationDays, sample });

  return patterns;
}

export function buildWeeklyReport(history: DaySummary[]): WeeklyReport | null {
  if (history.length === 0) return null;

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const weekStart = sorted[Math.max(0, sorted.length - 7)].date;
  const weekEnd = last.date;
  const currentScore = last.overall;
  const previous = sorted.length > 7 ? sorted[sorted.length - 8].overall : currentScore;
  const changePercent = previous === 0 ? 0 : Math.round(((currentScore - previous) / previous) * 100);

  const last7 = sorted.slice(-7);

  const improvements: string[] = [];
  if (last7.length >= 2) {
    const firstHalf = last7.slice(0, Math.ceil(last7.length / 2));
    const secondHalf = last7.slice(Math.ceil(last7.length / 2));
    const avgSleep = (arr: DaySummary[]) =>
      arr.reduce((s, d) => s + (d.sleepHours ?? 0), 0) / (arr.length || 1);
    const sleepDelta = avgSleep(secondHalf) - avgSleep(firstHalf);
    if (sleepDelta > 0.3) {
      improvements.push(`Average sleep increased by ${sleepDelta.toFixed(1)} hours`);
    }

    const avgScreen = (arr: DaySummary[]) =>
      arr.reduce((s, d) => s + (d.screenMinutes ?? 0), 0) / (arr.length || 1);
    const screenDelta = avgScreen(firstHalf) - avgScreen(secondHalf);
    if (screenDelta > 5) {
      improvements.push(`Screen time decreased by ${Math.round((screenDelta / (avgScreen(firstHalf) || 1)) * 100)}%`);
    }

    const outdoorDays = last7.filter((d) => (d.outdoorMinutes ?? 0) >= 15).length;
    if (outdoorDays >= 2) {
      improvements.push(`${outdoorDays} outdoor ${outdoorDays === 1 ? 'mission' : 'missions'} completed`);
    }

    const avgStress = (arr: DaySummary[]) =>
      arr.reduce((s, d) => s + d.stress, 0) / (arr.length || 1);
    const stressDelta = avgStress(firstHalf) - avgStress(secondHalf);
    if (stressDelta > 5) {
      improvements.push(`Stress reduced from ${Math.round(avgStress(firstHalf) / 10)}/10 to ${Math.round(avgStress(secondHalf) / 10)}/10`);
    }
  }

  if (improvements.length === 0) {
    improvements.push('You completed check-ins consistently this week');
  }

  // Main remaining challenge
  let challenge = 'Keep gathering data to surface a main challenge.';
  const lowDomains: { name: string; value: number }[] = [];
  if (last7.some((d) => (d.sleepHours ?? 99) < 6)) {
    lowDomains.push({ name: 'sleep schedule', value: last7.filter((d) => (d.sleepHours ?? 99) < 6).length });
  }
  if (last7.some((d) => d.stress >= 65)) {
    lowDomains.push({ name: 'stress', value: last7.filter((d) => d.stress >= 65).length });
  }
  if (last7.some((d) => (d.activeMinutes ?? 99) < 20)) {
    lowDomains.push({ name: 'physical activity', value: last7.filter((d) => (d.activeMinutes ?? 99) < 20).length });
  }
  lowDomains.sort((a, b) => b.value - a.value);
  if (lowDomains[0]) {
    challenge = `Your ${lowDomains[0].name} remains inconsistent this week.`;
  }

  // Top positive factor
  const topFactor =
    improvements[0] ?? 'Consistent daily check-ins';

  // Recommendation
  let recommendation = 'Continue your current rhythm and check in again tomorrow.';
  if (challenge.includes('sleep')) {
    recommendation = 'Try a gentle wind-down 30 minutes before bed for the next few nights.';
  } else if (challenge.includes('stress')) {
    recommendation = 'Consider a short breathing pause when stress rises, and protect a small recovery window each day.';
  } else if (challenge.includes('activity')) {
    recommendation = 'A brief outdoor walk a few times this week could gently lift energy.';
  }

  return {
    weekStart,
    weekEnd,
    currentScore,
    previousScore: previous,
    changePercent,
    improvements,
    challenge,
    recommendation,
    topFactor,
  };
}

const ACHIEVEMENT_DEFS: Omit<Achievement, 'earned' | 'earnedDate' | 'progress'>[] = [
  { id: 'sleep_consistency_7', name: 'Seven-Day Sleep Consistency', description: '7+ hours of sleep for seven days', icon: 'MoonStar' },
  { id: 'hydration_week', name: 'Hydration Week', description: 'Met hydration goals for seven days', icon: 'GlassWater' },
  { id: 'active_week', name: 'Active Week', description: 'Moved your body on seven days', icon: 'Dumbbell' },
  { id: 'screen_reduction', name: 'Screen-Time Reduction', description: 'Reduced pre-sleep screen use over a week', icon: 'MoonOff' },
  { id: 'outdoor_streak', name: 'Outdoor Streak', description: 'Spent time outdoors on five days', icon: 'TreePine' },
  { id: 'mission_consistency', name: 'Mission Consistency', description: 'Completed missions on seven days', icon: 'CheckCircle' },
  { id: 'balanced_week', name: 'Balanced Week', description: 'Maintained a wellness score of 70+ for a week', icon: 'Scale' },
];

export function evaluateAchievements(history: DaySummary[]): Achievement[] {
  const last7 = history.slice(-7);
  const last5 = history.slice(-5);

  const has = (days: DaySummary[], fn: (d: DaySummary) => boolean) => days.filter(fn);

  const sleepOk = has(last7, (d) => (d.sleepHours ?? 0) >= 7).length >= 7;
  const hydrationOk = has(last7, (d) => (d.waterGlasses ?? 0) >= 5).length >= 7;
  const activeOk = has(last7, (d) => (d.activeMinutes ?? 0) >= 15).length >= 7;
  const screenOk = has(last7, (d) => (d.screenMinutes ?? 999) <= 20).length >= 6;
  const outdoorOk = has(last5, (d) => (d.outdoorMinutes ?? 0) >= 15).length >= 5;
  const missionOk = has(last7, (d) => d.missionsCompleted > 0 && d.missionsCompleted === d.missionsTotal).length >= 7;
  const balancedOk = has(last7, (d) => d.overall >= 70).length >= 7;

  const checks: Record<string, { earned: boolean; progress: number }> = {
    sleep_consistency_7: { earned: sleepOk, progress: Math.min(100, Math.round((has(last7, (d) => (d.sleepHours ?? 0) >= 7).length / 7) * 100)) },
    hydration_week: { earned: hydrationOk, progress: Math.min(100, Math.round((has(last7, (d) => (d.waterGlasses ?? 0) >= 5).length / 7) * 100)) },
    active_week: { earned: activeOk, progress: Math.min(100, Math.round((has(last7, (d) => (d.activeMinutes ?? 0) >= 15).length / 7) * 100)) },
    screen_reduction: { earned: screenOk, progress: Math.min(100, Math.round((has(last7, (d) => (d.screenMinutes ?? 999) <= 20).length / 7) * 100)) },
    outdoor_streak: { earned: outdoorOk, progress: Math.min(100, Math.round((has(last5, (d) => (d.outdoorMinutes ?? 0) >= 15).length / 5) * 100)) },
    mission_consistency: { earned: missionOk, progress: Math.min(100, Math.round((has(last7, (d) => d.missionsCompleted > 0 && d.missionsCompleted === d.missionsTotal).length / 7) * 100)) },
    balanced_week: { earned: balancedOk, progress: Math.min(100, Math.round((has(last7, (d) => d.overall >= 70).length / 7) * 100)) },
  };

  return ACHIEVEMENT_DEFS.map((def) => {
    const c = checks[def.id];
    return {
      ...def,
      earned: c.earned,
      progress: c.progress,
      earnedDate: c.earned ? new Date().toISOString().slice(0, 10) : undefined,
    };
  });
}
