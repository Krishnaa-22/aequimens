import type { Question } from '../types';

// Core questions (always asked) — 5 quick questions, one per screen.
// Scores 1 (low/poor) to 5 (high/excellent). For stress, higher score = worse.
export const CORE_QUESTIONS: Question[] = [
  {
    id: 'mood_today',
    category: 'mood',
    text: 'How has your mood been today?',
    help: 'Take a moment to reflect on your overall mood since waking up.',
    type: 'scale',
    core: true,
    options: [
      { id: 'm1', label: 'Very Low', score: 1, icon: 'CloudRain' },
      { id: 'm2', label: 'Low', score: 2, icon: 'Cloud' },
      { id: 'm3', label: 'Neutral', score: 3, icon: 'CircleDashed' },
      { id: 'm4', label: 'Good', score: 4, icon: 'Sun' },
      { id: 'm5', label: 'Excellent', score: 5, icon: 'Sparkles' },
    ],
  },
  {
    id: 'energy_today',
    category: 'energy',
    text: 'How energetic do you feel?',
    help: 'Physical and mental energy combined.',
    type: 'scale',
    core: true,
    options: [
      { id: 'e1', label: 'Very Low', score: 1, icon: 'BatteryLow' },
      { id: 'e2', label: 'Low', score: 2, icon: 'BatteryMedium' },
      { id: 'e3', label: 'Neutral', score: 3, icon: 'Battery' },
      { id: 'e4', label: 'Good', score: 4, icon: 'BatteryFull' },
      { id: 'e5', label: 'Excellent', score: 5, icon: 'Zap' },
    ],
  },
  {
    id: 'stress_today',
    category: 'stress',
    text: 'How stressed do you feel?',
    help: 'Tension, pressure, or feeling overwhelmed.',
    type: 'scale',
    core: true,
    options: [
      { id: 's1', label: 'Very Calm', score: 1, icon: 'Leaf' },
      { id: 's2', label: 'Calm', score: 2, icon: 'Waves' },
      { id: 's3', label: 'Moderate', score: 3, icon: 'Wind' },
      { id: 's4', label: 'High', score: 4, icon: 'CloudLightning' },
      { id: 's5', label: 'Overwhelming', score: 5, icon: 'Tornado' },
    ],
  },
  {
    id: 'motivation_today',
    category: 'motivation',
    text: 'How motivated do you feel?',
    help: 'Your drive to engage with the day.',
    type: 'scale',
    core: true,
    options: [
      { id: 'mo1', label: 'Very Low', score: 1, icon: 'MinusCircle' },
      { id: 'mo2', label: 'Low', score: 2, icon: 'CircleSlash' },
      { id: 'mo3', label: 'Neutral', score: 3, icon: 'CircleDashed' },
      { id: 'mo4', label: 'Good', score: 4, icon: 'Flag' },
      { id: 'mo5', label: 'Excellent', score: 5, icon: 'Rocket' },
    ],
  },
  {
    id: 'sleep_quality',
    category: 'sleep',
    text: 'How well did you sleep?',
    help: 'Overall sleep quality last night.',
    type: 'scale',
    core: true,
    options: [
      { id: 'sl1', label: 'Very Poor', score: 1, icon: 'MoonStar' },
      { id: 'sl2', label: 'Poor', score: 2, icon: 'Moon' },
      { id: 'sl3', label: 'Fair', score: 3, icon: 'CloudMoon' },
      { id: 'sl4', label: 'Good', score: 4, icon: 'Stars' },
      { id: 'sl5', label: 'Excellent', score: 5, icon: 'Sunrise' },
    ],
  },
];

// Follow-up questions, shown only when a condition is met.
export const FOLLOW_UP_QUESTIONS: Question[] = [
  // ---- Sleep quality low ----
  {
    id: 'sleep_hours',
    category: 'sleep',
    text: 'How many hours did you sleep?',
    type: 'choice',
    core: false,
    followUp: { triggerQuestionId: 'sleep_quality', maxScore: 2 },
    options: [
      { id: 'sh1', label: 'Less than 4', score: 1, icon: 'Clock' },
      { id: 'sh2', label: '4–5 hours', score: 2, icon: 'Clock' },
      { id: 'sh3', label: '6 hours', score: 3, icon: 'Clock' },
      { id: 'sh4', label: '7–8 hours', score: 4, icon: 'Clock' },
      { id: 'sh5', label: 'More than 8', score: 5, icon: 'Clock' },
    ],
  },
  {
    id: 'sleep_interrupted',
    category: 'sleep',
    text: 'Was your sleep interrupted?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'sleep_quality', maxScore: 3 },
    options: [
      { id: 'si_no', label: 'No, mostly continuous', score: 5, icon: 'Check', value: false },
      { id: 'si_once', label: 'Once or twice', score: 3, icon: 'Minus', value: false },
      { id: 'si_yes', label: 'Yes, frequently', score: 1, icon: 'X', value: true },
    ],
  },
  {
    id: 'screen_before_bed',
    category: 'screen',
    text: 'Did you use a screen shortly before sleeping?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'sleep_quality', maxScore: 3 },
    options: [
      { id: 'sb_no', label: 'No, I avoided screens', score: 5, icon: 'MoonOff', value: false },
      { id: 'sb_some', label: 'A little', score: 3, icon: 'Smartphone', value: true },
      { id: 'sb_yes', label: 'Yes, for a while', score: 1, icon: 'MonitorSmartphone', value: true },
    ],
  },
  {
    id: 'late_bedtime',
    category: 'routine',
    text: 'Was your bedtime later than usual?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'sleep_quality', maxScore: 3 },
    options: [
      { id: 'lb_no', label: 'No, around my usual time', score: 5, icon: 'Clock', value: false },
      { id: 'lb_slight', label: 'Slightly later', score: 3, icon: 'Clock', value: false },
      { id: 'lb_yes', label: 'Yes, much later', score: 1, icon: 'Clock', value: true },
    ],
  },

  // ---- Stress high ----
  {
    id: 'stress_source',
    category: 'stress',
    text: 'What is creating the most stress?',
    help: 'Pick the area that feels heaviest right now.',
    type: 'choice',
    core: false,
    followUp: { triggerQuestionId: 'stress_today', minScore: 4 },
    options: [
      { id: 'ss_studies', label: 'Studies', score: 1, icon: 'GraduationCap' },
      { id: 'ss_work', label: 'Work', score: 1, icon: 'Briefcase' },
      { id: 'ss_family', label: 'Family', score: 1, icon: 'Users' },
      { id: 'ss_finances', label: 'Finances', score: 1, icon: 'Wallet' },
      { id: 'ss_relationships', label: 'Relationships', score: 1, icon: 'HeartHandshake' },
      { id: 'ss_uncertainty', label: 'Uncertainty', score: 1, icon: 'Compass' },
      { id: 'ss_other', label: 'Other', score: 1, icon: 'MoreHorizontal' },
    ],
  },
  {
    id: 'switch_off',
    category: 'stress',
    text: 'How difficult is it to switch off mentally?',
    type: 'scale',
    core: false,
    followUp: { triggerQuestionId: 'stress_today', minScore: 4 },
    options: [
      { id: 'so1', label: 'Easy', score: 1, icon: 'Feather' },
      { id: 'so2', label: 'Slightly hard', score: 2, icon: 'Wind' },
      { id: 'so3', label: 'Moderate', score: 3, icon: 'Cloud' },
      { id: 'so4', label: 'Hard', score: 4, icon: 'CloudFog' },
      { id: 'so5', label: 'Very hard', score: 5, icon: 'CloudLightning' },
    ],
  },
  {
    id: 'stress_routine',
    category: 'routine',
    text: 'Has stress affected your routine?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'stress_today', minScore: 4 },
    options: [
      { id: 'sr_no', label: 'Not really', score: 5, icon: 'Check', value: false },
      { id: 'sr_some', label: 'A little', score: 3, icon: 'Minus', value: true },
      { id: 'sr_yes', label: 'Yes, noticeably', score: 1, icon: 'X', value: true },
    ],
  },

  // ---- Energy low ----
  {
    id: 'water_intake',
    category: 'hydration',
    text: 'How much water did you drink?',
    type: 'choice',
    core: false,
    followUp: { triggerQuestionId: 'energy_today', maxScore: 2 },
    options: [
      { id: 'w1', label: 'Barely any', score: 1, icon: 'Droplet' },
      { id: 'w2', label: '1–2 glasses', score: 2, icon: 'Droplet' },
      { id: 'w3', label: '3–4 glasses', score: 3, icon: 'Droplets' },
      { id: 'w4', label: '5–6 glasses', score: 4, icon: 'Droplets' },
      { id: 'w5', label: '7+ glasses', score: 5, icon: 'GlassWater' },
    ],
  },
  {
    id: 'regular_meals',
    category: 'meals',
    text: 'Did you eat regular meals?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'energy_today', maxScore: 2 },
    options: [
      { id: 'rm_yes', label: 'Yes, all meals', score: 5, icon: 'Utensils', value: true },
      { id: 'rm_some', label: 'Skipped one', score: 3, icon: 'Sandwich', value: false },
      { id: 'rm_no', label: 'Mostly skipped', score: 1, icon: 'Soup', value: false },
    ],
  },
  {
    id: 'physical_activity',
    category: 'activity',
    text: 'How physically active were you?',
    type: 'choice',
    core: false,
    followUp: { triggerQuestionId: 'energy_today', maxScore: 2 },
    options: [
      { id: 'pa1', label: 'Not at all', score: 1, icon: 'Armchair' },
      { id: 'pa2', label: 'A little', score: 2, icon: 'Footprints' },
      { id: 'pa3', label: 'Some movement', score: 3, icon: 'PersonStanding' },
      { id: 'pa4', label: 'Quite active', score: 4, icon: 'Bike' },
      { id: 'pa5', label: 'Very active', score: 5, icon: 'Dumbbell' },
    ],
  },
  {
    id: 'outdoor_time',
    category: 'outdoor',
    text: 'Did you spend time outdoors?',
    type: 'choice',
    core: false,
    followUp: { triggerQuestionId: 'energy_today', maxScore: 2 },
    options: [
      { id: 'ot1', label: 'None', score: 1, icon: 'Home' },
      { id: 'ot2', label: 'A few minutes', score: 2, icon: 'DoorOpen' },
      { id: 'ot3', label: 'About 15 min', score: 3, icon: 'TreePine' },
      { id: 'ot4', label: '30+ minutes', score: 4, icon: 'Trees' },
      { id: 'ot5', label: 'A lot', score: 5, icon: 'Mountain' },
    ],
  },

  // ---- Mood low ----
  {
    id: 'social_time',
    category: 'social',
    text: 'Did you spend time with someone you trust?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'mood_today', maxScore: 2 },
    options: [
      { id: 'st_yes', label: 'Yes', score: 5, icon: 'HeartHandshake', value: true },
      { id: 'st_brief', label: 'Briefly', score: 3, icon: 'MessageCircle', value: true },
      { id: 'st_no', label: 'No', score: 1, icon: 'User', value: false },
    ],
  },
  {
    id: 'enjoyed_activities',
    category: 'mood',
    text: 'Did you enjoy any usual activities?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'mood_today', maxScore: 2 },
    options: [
      { id: 'ea_yes', label: 'Yes', score: 5, icon: 'Smile', value: true },
      { id: 'ea_some', label: 'A little', score: 3, icon: 'Meh', value: false },
      { id: 'ea_no', label: 'Not today', score: 1, icon: 'Frown', value: false },
    ],
  },
  {
    id: 'difficult_event',
    category: 'mood',
    text: 'Did anything difficult happen recently?',
    type: 'boolean',
    core: false,
    followUp: { triggerQuestionId: 'mood_today', maxScore: 3 },
    options: [
      { id: 'de_no', label: 'No', score: 5, icon: 'ShieldCheck', value: false },
      { id: 'de_minor', label: 'Something minor', score: 3, icon: 'Shield', value: true },
      { id: 'de_yes', label: 'Yes, something significant', score: 1, icon: 'ShieldAlert', value: true },
    ],
  },
  {
    id: 'social_connection',
    category: 'social',
    text: 'How connected did you feel to others?',
    type: 'scale',
    core: false,
    followUp: { triggerQuestionId: 'mood_today', maxScore: 2 },
    options: [
      { id: 'sc1', label: 'Disconnected', score: 1, icon: 'UserMinus' },
      { id: 'sc2', label: 'A bit isolated', score: 2, icon: 'User' },
      { id: 'sc3', label: 'Neutral', score: 3, icon: 'Users' },
      { id: 'sc4', label: 'Connected', score: 4, icon: 'HeartHandshake' },
      { id: 'sc5', label: 'Deeply connected', score: 5, icon: 'Heart' },
    ],
  },
];

export const ALL_QUESTIONS: Question[] = [...CORE_QUESTIONS, ...FOLLOW_UP_QUESTIONS];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, q]),
);

export const FOLLOW_UP_INTRO =
  'We noticed a few areas worth understanding better. Just a few more questions.';
