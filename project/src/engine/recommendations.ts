import type { Answers, Contributor, Mission, Category, MissionDifficulty } from '../types';

const MISSION_LIBRARY: Record<
  string,
  { name: string; reason: string; category: Category; difficulty: MissionDifficulty; minutes: number; icon: string }[]
> = {};

const ALL_MISSIONS: {
  id: string;
  name: string;
  reason: string;
  category: Category;
  difficulty: MissionDifficulty;
  minutes: number;
  icon: string;
  triggers: string[]; // contributor ids that make this mission relevant
}[] = [
  {
    id: 'water_boost',
    name: 'Drink two more glasses of water',
    reason: 'Even mild dehydration can reduce energy and focus.',
    category: 'hydration',
    difficulty: 'gentle',
    minutes: 5,
    icon: 'GlassWater',
    triggers: ['low_hydration'],
  },
  {
    id: 'outdoor_walk',
    name: 'Walk outdoors for 15 minutes',
    reason: 'Daylight and gentle movement can support mood and energy.',
    category: 'outdoor',
    difficulty: 'moderate',
    minutes: 15,
    icon: 'Footprints',
    triggers: ['limited_outdoor', 'low_activity', 'low_mood', 'feeling_disconnected'],
  },
  {
    id: 'screen_wind_down',
    name: 'Avoid screens for 30 minutes before sleep',
    reason: 'Reducing screen light before bed can make falling asleep easier.',
    category: 'screen',
    difficulty: 'moderate',
    minutes: 30,
    icon: 'MoonOff',
    triggers: ['screen_before_bed', 'short_sleep_duration', 'sleep_quality_low'],
  },
  {
    id: 'consistent_bedtime',
    name: 'Set a gentle bedtime reminder',
    reason: 'A steadier sleep schedule can improve how rested you feel.',
    category: 'sleep',
    difficulty: 'gentle',
    minutes: 5,
    icon: 'MoonStar',
    triggers: ['late_bedtime', 'short_sleep_duration', 'sleep_quality_low'],
  },
  {
    id: 'breathing_pause',
    name: 'Take a 4-minute breathing pause',
    reason: 'A short breathing exercise can help ease mental tension.',
    category: 'stress',
    difficulty: 'gentle',
    minutes: 4,
    icon: 'Wind',
    triggers: ['high_stress', 'hard_switch_off', 'stress_routine'],
  },
  {
    id: 'reach_out',
    name: 'Send a message to someone you trust',
    reason: 'A small moment of connection can support your mood.',
    category: 'social',
    difficulty: 'gentle',
    minutes: 5,
    icon: 'MessageCircle',
    triggers: ['low_social', 'feeling_disconnected', 'low_mood'],
  },
  {
    id: 'enjoy_activity',
    name: 'Spend 10 minutes on something you usually enjoy',
    reason: 'Re-engaging with enjoyable activities can gently lift mood.',
    category: 'mood',
    difficulty: 'moderate',
    minutes: 10,
    icon: 'Sparkles',
    triggers: ['no_enjoyed_activities', 'low_mood'],
  },
  {
    id: 'regular_meal',
    name: 'Have one regular, unhurried meal',
    reason: 'Steady nourishment can help stabilise energy through the day.',
    category: 'meals',
    difficulty: 'gentle',
    minutes: 20,
    icon: 'Utensils',
    triggers: ['skipped_meals', 'low_activity'],
  },
  {
    id: 'stretch_break',
    name: 'Take a 5-minute stretch break',
    reason: 'Brief movement can ease tension built up from stress.',
    category: 'activity',
    difficulty: 'gentle',
    minutes: 5,
    icon: 'PersonStanding',
    triggers: ['low_activity', 'high_stress', 'stress_routine'],
  },
  {
    id: 'wind_down_routine',
    name: 'Create a simple 10-minute wind-down',
    reason: 'A calm pre-sleep routine can improve sleep quality.',
    category: 'sleep',
    difficulty: 'moderate',
    minutes: 10,
    icon: 'Stars',
    triggers: ['sleep_quality_low', 'short_sleep_duration', 'screen_before_bed'],
  },
];

void MISSION_LIBRARY;

const DIFFICULTY_ORDER: Record<MissionDifficulty, number> = { gentle: 0, moderate: 1, focused: 2 };

/**
 * Generate three personalized missions.
 * Missions are ranked by how directly they address today's contributors
 * (high impact first), then by gentleness to keep the day approachable.
 */
export function generateMissions(_answers: Answers, contributors: Contributor[]): Mission[] {
  const contributorIds = new Set(contributors.filter((c) => c.direction === 'negative').map((c) => c.id));

  const scored = ALL_MISSIONS.map((m) => {
    const matches = m.triggers.filter((t) => contributorIds.has(t)).length;
    return { mission: m, matches };
  });

  // Always have a few fallback gentle missions even if no contributors matched.
  const ranked = scored.sort((a, b) => {
    if (b.matches !== a.matches) return b.matches - a.matches;
    return DIFFICULTY_ORDER[a.mission.difficulty] - DIFFICULTY_ORDER[b.mission.difficulty];
  });

  const chosen = ranked.slice(0, 3).map(({ mission }) => mission);

  // Ensure category variety where possible
  const seenCategories = new Set<Category>();
  const finalMissions: typeof chosen = [];
  for (const m of chosen) {
    if (seenCategories.has(m.category) && finalMissions.length < 3) {
      // allow duplicate only if we can't fill three with variety
    }
    seenCategories.add(m.category);
    finalMissions.push(m);
  }

  // Backfill if fewer than three (rare)
  let i = 0;
  while (finalMissions.length < 3 && i < ALL_MISSIONS.length) {
    const m = ALL_MISSIONS[i];
    if (!finalMissions.find((x) => x.id === m.id)) finalMissions.push(m);
    i++;
  }

  return finalMissions.slice(0, 3).map((m) => ({
    id: `${m.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: m.name,
    reason: m.reason,
    category: m.category,
    difficulty: m.difficulty,
    estimatedMinutes: m.minutes,
    icon: m.icon,
    completed: false,
    createdAt: new Date().toISOString(),
  }));
}

/** A replacement mission for the "replace" action. */
export function replacementMission(current: Mission[], contributors: Contributor[]): Mission {
  const contributorIds = new Set(contributors.filter((c) => c.direction === 'negative').map((c) => c.id));
  const currentIds = new Set(current.map((m) => m.id.split('_')[0]));
  const candidate = ALL_MISSIONS
    .filter((m) => !currentIds.has(m.id))
    .map((m) => ({ mission: m, matches: m.triggers.filter((t) => contributorIds.has(t)).length }))
    .sort((a, b) => b.matches - a.matches || DIFFICULTY_ORDER[a.mission.difficulty] - DIFFICULTY_ORDER[b.mission.difficulty])[0];

  const base = candidate?.mission ?? ALL_MISSIONS[0];
  return {
    id: `${base.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: base.name,
    reason: base.reason,
    category: base.category,
    difficulty: base.difficulty,
    estimatedMinutes: base.minutes,
    icon: base.icon,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

