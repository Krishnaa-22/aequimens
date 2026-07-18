import type {
  Answers,
  CheckInResult,
  Contributor,
  Category,
  DayStatus,
  DaySummary,
  ImpactLevel,
} from '../types';
import { QUESTION_BY_ID, FOLLOW_UP_QUESTIONS } from './questions';
import { generateMissions } from './recommendations';
import { todayISO } from '../utils/format';

/**
 * Transparent wellness scoring.
 *
 * Each domain (mood, energy, stress, sleep, motivation, plus lifestyle
 * factors) produces a normalized 0-100 score. For mood/energy/motivation/
 * sleep higher answers are better; for stress higher answers are worse, so
 * we invert. The overall score is a weighted blend of the five core domains.
 *
 * This is a general wellness estimate, not a medical assessment.
 */

const invert = (score1to5: number) => (6 - score1to5) * 25; // 5->25, 1->125... clamp later
const normalize = (score1to5: number) => Math.max(0, Math.min(100, score1to5 * 20 - 10));
// 1->10, 2->30, 3->50, 4->70, 5->90, then we smooth

const CORE_WEIGHTS: Record<Category, number> = {
  mood: 0.24,
  energy: 0.22,
  sleep: 0.22,
  stress: 0.2,
  motivation: 0.12,
  // lifestyle categories carry no direct weight in the overall score
  hydration: 0,
  activity: 0,
  screen: 0,
  outdoor: 0,
  social: 0,
  meals: 0,
  routine: 0,
};

function score1to5To100(score: number): number {
  // map 1..5 onto roughly 12..92 so neither floor nor ceiling feel absolute
  const clamped = Math.max(1, Math.min(5, score));
  return Math.round(12 + ((clamped - 1) / 4) * 80);
}

function stressScore100(score: number): number {
  // higher stress score (worse) -> lower wellness contribution
  return 100 - score1to5To100(score);
}

export interface ScoreBreakdown {
  category: Category;
  score: number;
  rawScore: number; // 1-5 input
  weight: number;
  label: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  mood: 'Mood',
  energy: 'Energy',
  stress: 'Stress',
  motivation: 'Motivation',
  sleep: 'Sleep',
  hydration: 'Hydration',
  activity: 'Activity',
  screen: 'Screen time',
  outdoor: 'Outdoor time',
  social: 'Social connection',
  meals: 'Meals',
  routine: 'Routine',
};

export function computeBreakdown(answers: Answers): {
  domainScores: Record<Category, number>;
  breakdown: ScoreBreakdown[];
  overall: number;
} {
  const domainScores = {} as Record<Category, number>;
  const breakdown: ScoreBreakdown[] = [];

  // Core domains
  (['mood', 'energy', 'motivation', 'sleep', 'stress'] as Category[]).forEach((cat) => {
    const q = Object.values(QUESTION_BY_ID).find((qq) => qq.category === cat && qq.core);
    const ans = q ? answers[q.id] : undefined;
    const raw = ans?.score ?? 3;
    const score = cat === 'stress' ? stressScore100(raw) : score1to5To100(raw);
    domainScores[cat] = score;
    breakdown.push({
      category: cat,
      score,
      rawScore: raw,
      weight: CORE_WEIGHTS[cat],
      label: CATEGORY_LABELS[cat],
    });
  });

  // Lifestyle domains — derived from follow-ups if answered
  const lifestyleScorers: { category: Category; questionIds: string[] }[] = [
    { category: 'hydration', questionIds: ['water_intake'] },
    { category: 'activity', questionIds: ['physical_activity'] },
    { category: 'outdoor', questionIds: ['outdoor_time'] },
    { category: 'screen', questionIds: ['screen_before_bed'] },
    { category: 'social', questionIds: ['social_time', 'social_connection'] },
    { category: 'meals', questionIds: ['regular_meals'] },
    { category: 'routine', questionIds: ['late_bedtime', 'stress_routine'] },
  ];

  lifestyleScorers.forEach(({ category, questionIds }) => {
    const answered = questionIds.map((id) => answers[id]).filter(Boolean);
    if (answered.length === 0) {
      domainScores[category] = 50; // neutral default
      return;
    }
    const avgRaw = answered.reduce((s, a) => s + a.score, 0) / answered.length;
    domainScores[category] = Math.round(score1to5To100(avgRaw));
  });

  const overall = Math.round(
    breakdown.reduce((sum, b) => sum + b.score * b.weight, 0),
  );

  return { domainScores, breakdown, overall: Math.max(8, Math.min(98, overall)) };
}

/** Determine likely contributors based on today's answers. */
export function computeContributors(answers: Answers): Contributor[] {
  const contributors: Contributor[] = [];

  const add = (
    id: string,
    category: Category,
    label: string,
    impact: ImpactLevel,
    detail: string,
    direction: 'negative' | 'positive' = 'negative',
  ) => contributors.push({ id, category, label, impact, detail, direction });

  // ---- Sleep ----
  const sleepAns = answers['sleep_quality'];
  const sleepHours = answers['sleep_hours'];
  const screenBed = answers['screen_before_bed'];
  const interrupted = answers['sleep_interrupted'];
  const lateBed = answers['late_bedtime'];

  if (sleepAns && sleepAns.score <= 2) {
    add('sleep_quality_low', 'sleep', 'Low sleep quality', 'high',
      'Poor sleep quality tends to reduce energy and mood the next day.');
  }
  if (sleepHours && sleepHours.score <= 2) {
    add('short_sleep_duration', 'sleep', 'Short sleep duration', 'high',
      'Sleeping fewer than six hours may be influencing your energy and focus.');
  }
  if (screenBed && screenBed.value === true) {
    add('screen_before_bed', 'screen', 'Screen use before sleep', 'moderate',
      'Screen light before bed may make falling asleep harder.');
  }
  if (interrupted && interrupted.value === true) {
    add('sleep_interrupted', 'sleep', 'Interrupted sleep', 'moderate',
      'Broken sleep can reduce how rested you feel.');
  }
  if (lateBed && lateBed.value === true) {
    add('late_bedtime', 'routine', 'Later than usual bedtime', 'small',
      'A shifted bedtime may affect your rhythm today.');
  }

  // ---- Stress ----
  const stressAns = answers['stress_today'];
  const stressSource = answers['stress_source'];
  const switchOff = answers['switch_off'];
  const stressRoutine = answers['stress_routine'];

  if (stressAns && stressAns.score >= 4) {
    const sourceLabel = stressSource ? stressSource.label : 'High stress';
    add('high_stress', 'stress', `${sourceLabel} stress`, 'high',
      'Elevated stress may be affecting your mood, energy, and sleep.');
  }
  if (switchOff && switchOff.score >= 4) {
    add('hard_switch_off', 'stress', 'Difficulty switching off mentally', 'moderate',
      'Racing thoughts can keep stress lingering into the evening.');
  }
  if (stressRoutine && stressRoutine.value === true) {
    add('stress_routine', 'routine', 'Stress affecting your routine', 'moderate',
      'When stress disrupts routines, wellbeing often follows.');
  }

  // ---- Energy / lifestyle ----
  const water = answers['water_intake'];
  const meals = answers['regular_meals'];
  const activity = answers['physical_activity'];
  const outdoor = answers['outdoor_time'];

  if (water && water.score <= 2) {
    add('low_hydration', 'hydration', 'Low hydration', 'small',
      'Even mild dehydration can reduce energy and concentration.');
  }
  if (meals && meals.score <= 2) {
    add('skipped_meals', 'meals', 'Skipped meals', 'small',
      'Irregular eating may contribute to low energy.');
  }
  if (activity && activity.score <= 2) {
    add('low_activity', 'activity', 'Low physical activity', 'moderate',
      'Limited movement may be influencing your energy and mood.');
  }
  if (outdoor && outdoor.score <= 2) {
    add('limited_outdoor', 'outdoor', 'Limited outdoor time', 'small',
      'Time outside and daylight may support mood and energy.');
  }

  // ---- Mood / social ----
  const moodAns = answers['mood_today'];
  const social = answers['social_time'];
  const socialConn = answers['social_connection'];
  const enjoyed = answers['enjoyed_activities'];
  const difficult = answers['difficult_event'];

  if (moodAns && moodAns.score <= 2) {
    add('low_mood', 'mood', 'Lower mood today', 'high',
      'Your mood today appears reduced compared to your usual balance.');
  }
  if (social && social.value === false) {
    add('low_social', 'social', 'Limited social connection', 'moderate',
      'Connection with people you trust may support mood.');
  }
  if (socialConn && socialConn.score <= 2) {
    add('feeling_disconnected', 'social', 'Feeling disconnected', 'moderate',
      'A sense of disconnection may be influencing mood today.');
  }
  if (enjoyed && enjoyed.value === false) {
    add('no_enjoyed_activities', 'mood', 'Few enjoyable activities', 'small',
      'Engaging in usual enjoyable activities can gently lift mood.');
  }
  if (difficult && difficult.value === true) {
    add('difficult_event', 'mood', 'A recent difficult event', 'moderate',
      'Something difficult may still be affecting you today.');
  }

  // ---- Positive contributors ----
  if (sleepAns && sleepAns.score >= 4 && (!sleepHours || sleepHours.score >= 4)) {
    add('good_sleep', 'sleep', 'Restful sleep', 'moderate',
      'Good sleep is likely supporting your energy and mood today.', 'positive');
  }
  if (outdoor && outdoor.score >= 4) {
    add('outdoor_positive', 'outdoor', 'Time outdoors', 'small',
      'Outdoor time and daylight often support wellbeing.', 'positive');
  }
  if (activity && activity.score >= 4) {
    add('activity_positive', 'activity', 'Physical activity', 'small',
      'Movement today is likely contributing positively.', 'positive');
  }
  if (social && social.value === true) {
    add('social_positive', 'social', 'Supportive connection', 'small',
      'Time with someone you trust may be supporting your mood.', 'positive');
  }
  if (water && water.score >= 4) {
    add('hydration_positive', 'hydration', 'Good hydration', 'small',
      'Staying hydrated can support steady energy.', 'positive');
  }

  // Sort: high -> moderate -> small, negatives first within each tier
  const order: Record<ImpactLevel, number> = { high: 0, moderate: 1, small: 2 };
  contributors.sort((a, b) => {
    if (order[a.impact] !== order[b.impact]) return order[a.impact] - order[b.impact];
    if (a.direction !== b.direction) return a.direction === 'negative' ? -1 : 1;
    return 0;
  });

  return contributors;
}

export function buildExplanation(answers: Answers, overall: number, contributors: Contributor[]): string {
  void answers;
  const negative = contributors.filter((c) => c.direction === 'negative');
  const positive = contributors.filter((c) => c.direction === 'positive');

  const primary = negative.find((c) => c.impact === 'high');
  const secondary = negative.filter((c) => c.impact === 'moderate').slice(0, 2);

  let phrase: string;
  if (overall >= 75) {
    phrase = "Today's check-in suggests your wellbeing is in a good place.";
  } else if (overall >= 50) {
    phrase = "Today's check-in suggests your wellbeing is balanced with a few areas to tend to.";
  } else if (overall >= 30) {
    phrase = "Today's check-in suggests your wellbeing is a little strained.";
  } else {
    phrase = "Today's check-in suggests your wellbeing is under pressure right now.";
  }

  const parts: string[] = [phrase];

  if (primary) {
    parts.push(`${primary.label.toLowerCase()} appears to be the strongest likely contributor.`);
  }
  if (secondary.length > 0) {
    parts.push(
      `${secondary.map((c) => c.label.toLowerCase()).join(' and ')} may also be influencing how you feel.`,
    );
  }
  if (positive.length > 0) {
    parts.push(
      `${positive.slice(0, 2).map((c) => c.label.toLowerCase()).join(' and ')} are likely supporting you today.`,
    );
  }
  if (negative.length === 0) {
    parts.push("No strong negative contributors showed up in today's responses.");
  }

  parts.push("These are general wellness insights based on today's responses, not a medical assessment.");

  return parts.join(' ');
}

export function dayStatusFromScore(overall: number): DayStatus {
  if (overall >= 75) return 'strong';
  if (overall >= 58) return 'good';
  if (overall >= 40) return 'balanced';
  return 'difficult';
}

export function runCheckIn(answers: Answers): CheckInResult {
  const { domainScores, overall } = computeBreakdown(answers);
  const contributors = computeContributors(answers);
  const explanation = buildExplanation(answers, overall, contributors);
  const missions = generateMissions(answers, contributors);

  return {
    date: todayISO(),
    overall,
    domainScores,
    contributors,
    explanation,
    missions,
    answers,
  };
}

/** Build a DaySummary suitable for history/charts from a check-in result. */
export function toDaySummary(result: CheckInResult): DaySummary {
  const a = result.answers;
  const missionTotal = result.missions.length;
  const missionCompleted = result.missions.filter((m) => m.completed).length;

  const sleepHoursAns = a['sleep_hours'];
  const sleepHours = sleepHoursAns
    ? [3.5, 4.5, 6, 7.5, 9][Math.max(0, Math.min(4, sleepHoursAns.score - 1))]
    : undefined;

  const waterAns = a['water_intake'];
  const waterGlasses = waterAns ? [0, 1.5, 3.5, 5.5, 7][Math.max(0, Math.min(4, waterAns.score - 1))] : undefined;

  const activityAns = a['physical_activity'];
  const activeMinutes = activityAns ? [0, 10, 25, 45, 75][Math.max(0, Math.min(4, activityAns.score - 1))] : undefined;

  const outdoorAns = a['outdoor_time'];
  const outdoorMinutes = outdoorAns ? [0, 5, 15, 35, 90][Math.max(0, Math.min(4, outdoorAns.score - 1))] : undefined;

  const screenAns = a['screen_before_bed'];
  const screenMinutes = screenAns
    ? screenAns.value === true
      ? screenAns.optionId === 'sb_yes'
        ? 60
        : 25
      : 5
    : undefined;

  return {
    date: result.date,
    overall: result.overall,
    mood: result.domainScores.mood,
    energy: result.domainScores.energy,
    stress: result.domainScores.stress,
    sleep: result.domainScores.sleep,
    motivation: result.domainScores.motivation,
    sleepHours,
    screenMinutes,
    waterGlasses,
    activeMinutes,
    outdoorMinutes,
    missionsCompleted: missionCompleted,
    missionsTotal: missionTotal,
    status: dayStatusFromScore(result.overall),
  };
}

export function categoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}

// silence unused import in some builds
void FOLLOW_UP_QUESTIONS;
void normalize;
void invert;
