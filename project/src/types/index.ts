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
