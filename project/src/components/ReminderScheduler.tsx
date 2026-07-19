import { useEffect } from 'react';
import { storage } from '../data/localStorage';
import { DEFAULT_PREFERENCES } from '../data/mockData';
import { todayISO } from '../utils/format';

interface ReminderCandidate {
  id: string;
  time: string;
  title: string;
  body: string;
  url: string;
}

const BUILT_IN_REMINDERS = [
  { enabled: 'morningCheckIn', time: 'morningCheckInTime', id: 'morning', title: 'Morning check-in', body: 'A short check-in can help you map the day ahead.', url: '/app/morning-check-in' },
  { enabled: 'waterReminder', time: 'waterReminderTime', id: 'water', title: 'Hydration pause', body: 'A small water break may help.', url: '/app/habits' },
  { enabled: 'outdoorReminder', time: 'outdoorReminderTime', id: 'outdoor', title: 'Outdoor break', body: 'A few minutes outside could feel good.', url: '/app/habits' },
  { enabled: 'eveningReview', time: 'eveningReviewTime', id: 'evening', title: 'Evening reflection', body: 'Take a moment to note what helped today.', url: '/app/evening-check-in' },
  { enabled: 'sleepReminder', time: 'sleepReminderTime', id: 'sleep', title: 'Sleep wind-down', body: 'This may be a good time to begin winding down.', url: '/app/routines' },
] as const;

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function candidatesForToday(): ReminderCandidate[] {
  const preferences = storage.getPreferences() ?? DEFAULT_PREFERENCES;
  const reminders: ReminderCandidate[] = [];

  BUILT_IN_REMINDERS.forEach((item) => {
    if (preferences.notifications[item.enabled]) {
      reminders.push({
        id: item.id,
        time: preferences.notifications[item.time],
        title: item.title,
        body: item.body,
        url: item.url,
      });
    }
  });

  if (preferences.notifications.weeklyReport && new Date().getDay() === 0) {
    reminders.push({
      id: 'weekly-report',
      time: preferences.notifications.weeklyReportTime,
      title: 'Weekly reflection',
      body: 'Your weekly reflection is ready when you are.',
      url: '/app/insights',
    });
  }

  const weekday = new Date().getDay();
  const date = todayISO();
  const completedHabitIds = new Set(
    storage.getHabitLogs().filter((log) => log.date === date && log.completed).map((log) => log.habitId),
  );
  storage.getHabits().forEach((habit) => {
    if (habit.active && habit.reminderTime && habit.daysOfWeek.includes(weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6) && !completedHabitIds.has(habit.id)) {
      reminders.push({
        id: `habit-${habit.id}`,
        time: habit.reminderTime,
        title: habit.title,
        body: habit.target || 'Your habit reminder is ready.',
        url: '/app/habits',
      });
    }
  });

  const completedRoutineIds = new Set(
    storage.getRoutineLogs().filter((log) => log.date === date && log.completed).map((log) => log.routineId),
  );
  storage.getRoutines().forEach((routine) => {
    if (routine.active && routine.reminderTime && routine.daysOfWeek.includes(weekday as 0 | 1 | 2 | 3 | 4 | 5 | 6) && !completedRoutineIds.has(routine.id)) {
      reminders.push({
        id: `routine-${routine.id}`,
        time: routine.reminderTime,
        title: routine.name,
        body: 'Your routine is ready.',
        url: '/app/routines',
      });
    }
  });

  return reminders;
}

async function deliver(reminder: ReminderCandidate): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const lock = storage.getPrivacyLock();
  const title = lock.hideNotificationDetails ? 'Aequimens reminder' : reminder.title;
  const body = lock.hideNotificationDetails ? 'Open Aequimens when you have a moment.' : reminder.body;
  const registration = await navigator.serviceWorker?.ready.catch(() => null);

  if (registration) {
    await registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `aequimens-${reminder.id}`,
      data: { url: reminder.url },
    });
  } else {
    new Notification(title, { body, icon: '/icons/icon-192.png', tag: `aequimens-${reminder.id}` });
  }
}

export function ReminderScheduler() {
  useEffect(() => {
    const check = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;
      const date = todayISO();
      const time = currentTime();
      const log = storage.getReminderLog();

      for (const reminder of candidatesForToday()) {
        if (reminder.time === time && log[reminder.id] !== date) {
          await deliver(reminder);
          storage.markReminderDelivered(reminder.id, date);
        }
      }
    };

    void check();
    const timer = window.setInterval(() => void check(), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
