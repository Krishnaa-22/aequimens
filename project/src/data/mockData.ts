import type { DaySummary, Preferences } from '../types';
import { localDateISO } from '../utils/format';

/**
 * Seed mock history so charts, progress, and insights have meaningful content
 * during local development/demo exploration. This is NEVER used for real
 * users — it is only invoked when DEMO_MODE_ENABLED (see ../config.ts) is
 * true, which requires both a dev build and an explicit opt-in env flag.
 */
export function buildMockHistory(): DaySummary[] {
  const days: DaySummary[] = [];
  const today = new Date();
  const seed = [
    { m: 62, e: 50, s: 64, sl: 52, mo: 58, sh: 5.5, sc: 55, w: 3, a: 10, o: 5, mc: 1, mt: 3 },
    { m: 58, e: 48, s: 70, sl: 48, mo: 54, sh: 5.0, sc: 65, w: 2, a: 5, o: 0, mc: 2, mt: 3 },
    { m: 66, e: 60, s: 55, sl: 64, mo: 62, sh: 6.5, sc: 40, w: 4, a: 20, o: 15, mc: 2, mt: 3 },
    { m: 70, e: 66, s: 48, sl: 72, mo: 68, sh: 7.0, sc: 25, w: 5, a: 30, o: 20, mc: 3, mt: 3 },
    { m: 64, e: 58, s: 62, sl: 58, mo: 60, sh: 6.0, sc: 50, w: 4, a: 15, o: 10, mc: 2, mt: 3 },
    { m: 74, e: 70, s: 44, sl: 76, mo: 72, sh: 7.5, sc: 20, w: 6, a: 35, o: 25, mc: 3, mt: 3 },
    { m: 72, e: 68, s: 46, sl: 74, mo: 70, sh: 7.2, sc: 18, w: 6, a: 28, o: 22, mc: 3, mt: 3 },
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const row = seed[6 - i];
    const overall = Math.round(row.m * 0.24 + row.e * 0.22 + row.sl * 0.22 + (100 - row.s) * 0.2 + row.mo * 0.12);
    days.push({
      date: localDateISO(d),
      overall,
      mood: row.m,
      energy: row.e,
      stress: row.s,
      sleep: row.sl,
      motivation: row.mo,
      sleepHours: row.sh,
      screenMinutes: row.sc,
      waterGlasses: row.w,
      activeMinutes: row.a,
      outdoorMinutes: row.o,
      missionsCompleted: row.mc,
      missionsTotal: row.mt,
      status: overall >= 75 ? 'strong' : overall >= 58 ? 'good' : overall >= 40 ? 'balanced' : 'difficult',
    });
  }
  return days;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'light',
  reducedMotion: false,
  notifications: {
    morningCheckIn: true,
    morningCheckInTime: '08:30',
    waterReminder: true,
    waterReminderTime: '11:00',
    outdoorReminder: false,
    outdoorReminderTime: '14:00',
    eveningReview: true,
    eveningReviewTime: '19:30',
    sleepReminder: true,
    sleepReminderTime: '22:00',
    weeklyReport: true,
    weeklyReportTime: '09:00',
  },
};

export const SAMPLE_NOTIFICATIONS: Record<string, string[]> = {
  morningCheckIn: ['Ready for a quick check-in?', 'A moment to check in with yourself.'],
  waterReminder: ['A small water break may help.', 'Time for a sip of water.'],
  outdoorReminder: ['A few minutes outside could feel good.', 'Some daylight may help your energy.'],
  eveningReview: ['Your evening mission review is ready.', "A gentle check on today's missions."],
  sleepReminder: ['Time to start winding down.', 'A calm wind-down may help your sleep.'],
  weeklyReport: ['Your weekly wellness reflection is available.', 'Your week in review is ready.'],
};
