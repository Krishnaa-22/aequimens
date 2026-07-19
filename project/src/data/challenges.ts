import type { ChallengeTemplate } from '../types';

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'sleep-reset-7',
    name: '7-Day Sleep Reset',
    description: 'A week of gentle, consistent wind-downs to support better sleep.',
    durationDays: 7,
    icon: 'MoonStar',
    habit: {
      title: 'Wind down before bed',
      target: '30 minutes screen-free before sleep',
      category: 'sleep',
      difficulty: 'easy',
      icon: 'MoonStar',
    },
  },
  {
    id: 'hydration-week',
    name: 'Hydration Week',
    description: 'Build a steady hydration habit over seven days.',
    durationDays: 7,
    icon: 'GlassWater',
    habit: {
      title: 'Stay hydrated',
      target: '6 glasses of water',
      category: 'hydration',
      difficulty: 'easy',
      icon: 'GlassWater',
    },
  },
  {
    id: 'screen-time-reduction',
    name: 'Screen-Time Reduction',
    description: 'Gradually ease off screens in the evenings this week.',
    durationDays: 7,
    icon: 'MoonOff',
    habit: {
      title: 'Reduce evening screen time',
      target: 'Screens off 45 minutes earlier',
      category: 'screen',
      difficulty: 'medium',
      icon: 'MoonOff',
    },
  },
  {
    id: 'outdoor-time',
    name: 'Outdoor Time Challenge',
    description: 'Spend a little time outdoors most days this week.',
    durationDays: 7,
    icon: 'TreePine',
    habit: {
      title: 'Get outside',
      target: '15 minutes outdoors',
      category: 'outdoor',
      difficulty: 'easy',
      icon: 'TreePine',
    },
  },
];
