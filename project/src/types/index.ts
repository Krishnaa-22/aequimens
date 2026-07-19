// Core domain types for the Aequimens wellness engine.

export type Category =
  | 'mood'
  | 'energy'
  | 'stress'
  | 'motivation'
  | 'sleep'
  | 'hydration'
  | 'activity'
  | 'screen'
  | 'outdoor'
  | 'social'
  | 'meals'
  | 'routine';

export type QuestionType = 'scale' | 'choice' | 'hours' | 'boolean';

export interface AnswerOption {
  id: string;
  label: string;
  /** Score from 1 (low/poor) to 5 (high/excellent). For stress, higher = worse. */
  score: number;
  icon: string; // lucide icon key
  /** Optional boolean value derived from this answer (for yes/no style). */
  value?: boolean;
}

export interface Question {
  id: string;
  category: Category;
  text: string;
  help?: string;
  type: QuestionType;
  options: AnswerOption[];
  /** When true, this is a core (always-asked) question. */
  core: boolean;
  /** Condition that determines whether a follow-up question should appear. */
  followUp?: FollowUpCondition;
  /** Optional unit label for hours-type questions. */
  unit?: string;
}

export type FollowUpCondition = {
  /** Reference question id whose answer triggers this follow-up. */
  triggerQuestionId: string;
  /** Trigger when the trigger answer's score is <= this (low). */
  maxScore?: number;
  /** Trigger when the trigger answer's score is >= this (high). */
  minScore?: number;
  /** Trigger when the trigger answer matches one of these option ids. */
  optionIds?: string[];
};

export type Answers = Record<string, AnswerRecord>;

export interface AnswerRecord {
  questionId: string;
  optionId: string;
  score: number;
  label: string;
  category: Category;
  value?: boolean;
  answeredAt: string;
}

export interface CheckInResult {
  date: string; // ISO date YYYY-MM-DD
  overall: number; // 0-100
  domainScores: Record<Category, number>;
  contributors: Contributor[];
  explanation: string;
  missions: Mission[];
  answers: Answers;
}

export type ImpactLevel = 'high' | 'moderate' | 'small';

export interface Contributor {
  id: string;
  category: Category;
  label: string;
  impact: ImpactLevel;
  detail: string;
  /** Negative contributors reduce wellness. */
  direction: 'negative' | 'positive';
}

export type MissionDifficulty = 'gentle' | 'moderate' | 'focused';

export interface Mission {
  id: string;
  name: string;
  reason: string;
  category: Category;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  icon: string;
  completed: boolean;
  createdAt: string;
}

export interface MissionSet {
  date: string;
  missions: Mission[];
}

export interface DaySummary {
  date: string;
  overall: number;
  mood: number;
  energy: number;
  stress: number; // higher = worse internally, charted as inverted
  sleep: number;
  motivation: number;
  sleepHours?: number;
  screenMinutes?: number;
  waterGlasses?: number;
  activeMinutes?: number;
  outdoorMinutes?: number;
  missionsCompleted: number;
  missionsTotal: number;
  status: DayStatus;
}

export type DayStatus = 'strong' | 'good' | 'balanced' | 'difficult';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number; // 0-100
}

export interface Preferences {
  theme: 'light' | 'system';
  notifications: NotificationSettings;
  reducedMotion: boolean;
}

export interface NotificationSettings {
  morningCheckIn: boolean;
  morningCheckInTime: string;
  waterReminder: boolean;
  waterReminderTime: string;
  outdoorReminder: boolean;
  outdoorReminderTime: string;
  eveningReview: boolean;
  eveningReviewTime: string;
  sleepReminder: boolean;
  sleepReminderTime: string;
  weeklyReport: boolean;
  weeklyReportTime: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  currentScore: number;
  previousScore: number;
  changePercent: number;
  improvements: string[];
  challenge: string;
  recommendation: string;
  topFactor: string;
}

export interface TriggerPattern {
  id: string;
  label: string;
  type: 'negative' | 'positive';
  occurrences: number;
  sample: boolean;
}

// ---------------------------------------------------------------------------
// Custom habits
// ---------------------------------------------------------------------------

export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Habit {
  id: string;
  title: string;
  category?: Category | 'custom';
  target: string; // free-text target description, e.g. "3 glasses" or "10 minutes"
  reminderTime?: string; // "HH:MM", optional
  daysOfWeek: WeekdayIndex[];
  difficulty: HabitDifficulty;
  active: boolean;
  createdAt: string;
  icon?: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Morning / evening check-ins
// ---------------------------------------------------------------------------

export interface MorningCheckIn {
  date: string;
  sleepQuality: number; // 1-5
  morningEnergy: number; // 1-5
  focus: string;
  completedAt: string;
}

export interface EveningCheckIn {
  date: string;
  mood: number; // 1-5
  stress: number; // 1-5, higher = more stressed
  whatHelped: string[]; // free-text tags/entries
  whatWasHard: string[];
  reflection?: string;
  completedAt: string;
}

// ---------------------------------------------------------------------------
// Context markers
// ---------------------------------------------------------------------------

export type ContextMarkerType =
  | 'exam'
  | 'travel'
  | 'family'
  | 'deadline'
  | 'social'
  | 'custom';

export interface ContextMarker {
  id: string;
  type: ContextMarkerType;
  label: string;
  startDate: string;
  endDate?: string; // absent = ongoing/single day
  note?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

export type ChallengeTemplateId =
  | 'sleep-reset-7'
  | 'hydration-week'
  | 'screen-time-reduction'
  | 'outdoor-time';

export interface ChallengeTemplate {
  id: ChallengeTemplateId;
  name: string;
  description: string;
  durationDays: number;
  icon: string;
  habit: Pick<Habit, 'title' | 'target' | 'category' | 'difficulty' | 'icon'>;
}

export interface ChallengeParticipation {
  id: string;
  templateId: ChallengeTemplateId;
  habitId: string; // generated habit backing this challenge
  startDate: string;
  endDate: string;
  completedDates: string[];
  active: boolean;
}

// ---------------------------------------------------------------------------
// Timeline (derived, not stored directly)
// ---------------------------------------------------------------------------

export type TimelineEntryType =
  | 'check-in'
  | 'morning'
  | 'evening'
  | 'habit'
  | 'mission'
  | 'context'
  | 'achievement'
  | 'journal'
  | 'routine';

export interface TimelineEntry {
  id: string;
  date: string;
  type: TimelineEntryType;
  title: string;
  detail?: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// Improved weekly report
// ---------------------------------------------------------------------------

export interface EnhancedWeeklyReport extends WeeklyReport {
  strongestImprovement: string;
  biggestChallenge: string;
  helpfulHabits: string[];
  consistency: number; // 0-100, share of days with any activity logged
  nextWeekSuggestion: string;
}

// ---------------------------------------------------------------------------
// Monthly wellness story
// ---------------------------------------------------------------------------

export interface MonthlyStory {
  month: string; // YYYY-MM
  hasEnoughData: boolean;
  bestWeekLabel?: string;
  topImprovement?: string;
  strongestHabit?: string;
  biggestChallenge?: string;
  completionPercent?: number;
  highlight?: string;
}

// ---------------------------------------------------------------------------
// Personal profile and onboarding
// ---------------------------------------------------------------------------

export type LifeStage = 'student' | 'professional' | 'both' | 'other';
export type CheckInPreference = 'morning' | 'evening' | 'both' | 'flexible';

export interface UserProfile {
  preferredName: string;
  age: number;
  lifeStage: LifeStage;
  primaryGoals: string[];
  wakeTime: string;
  sleepTime: string;
  checkInPreference: CheckInPreference;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Personal goals
// ---------------------------------------------------------------------------

export type GoalCategory =
  | 'sleep'
  | 'stress'
  | 'energy'
  | 'screen'
  | 'routine'
  | 'activity'
  | 'hydration'
  | 'outdoor'
  | 'social'
  | 'custom';

export interface PersonalGoal {
  id: string;
  title: string;
  category: GoalCategory;
  target: string;
  timeframeWeeks: number;
  active: boolean;
  createdAt: string;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Private journal
// ---------------------------------------------------------------------------

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood?: number;
  contextTags: string[];
  whatHelped: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Reusable routines
// ---------------------------------------------------------------------------

export type RoutineType = 'morning' | 'evening' | 'custom';

export interface RoutineItem {
  id: string;
  title: string;
}

export interface Routine {
  id: string;
  name: string;
  type: RoutineType;
  items: RoutineItem[];
  reminderTime?: string;
  daysOfWeek: WeekdayIndex[];
  active: boolean;
  createdAt: string;
}

export interface RoutineLog {
  routineId: string;
  itemId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
}

// ---------------------------------------------------------------------------
// Local privacy lock
// ---------------------------------------------------------------------------

export interface PrivacyLockSettings {
  enabled: boolean;
  pinHash?: string;
  autoLockMinutes: number;
  hideNotificationDetails: boolean;
}

// ---------------------------------------------------------------------------
// Derived personalisation insights
// ---------------------------------------------------------------------------

export interface BestStateProfile {
  conditions: string[];
  sampleSize: number;
}

export interface SimilarDayInsight {
  date: string;
  similarity: number;
  summary: string;
}
