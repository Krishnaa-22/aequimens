import { useState } from 'react';
import { Icon } from '../components/Icon';
import { usePreferences, useProfile, useToast } from '../hooks';
import { storage } from '../data/localStorage';

type NotificationBooleanKey = 'morningCheckIn' | 'waterReminder' | 'outdoorReminder' | 'eveningReview' | 'sleepReminder' | 'weeklyReport';
type NotificationTimeKey = 'morningCheckInTime' | 'waterReminderTime' | 'outdoorReminderTime' | 'eveningReviewTime' | 'sleepReminderTime' | 'weeklyReportTime';

const RULES: { key: NotificationBooleanKey; timeKey: NotificationTimeKey; label: string; description: string; icon: string }[] = [
  { key: 'morningCheckIn', timeKey: 'morningCheckInTime', label: 'Morning check-in', description: 'A gentle prompt to map your morning.', icon: 'Sunrise' },
  { key: 'waterReminder', timeKey: 'waterReminderTime', label: 'Hydration pause', description: 'One local reminder to take a water break.', icon: 'Droplets' },
  { key: 'outdoorReminder', timeKey: 'outdoorReminderTime', label: 'Outdoor break', description: 'A small nudge to step outside.', icon: 'TreePine' },
  { key: 'eveningReview', timeKey: 'eveningReviewTime', label: 'Evening reflection', description: 'Close the day with a short reflection.', icon: 'MoonStar' },
  { key: 'sleepReminder', timeKey: 'sleepReminderTime', label: 'Sleep wind-down', description: 'Prepare for a calmer end to the day.', icon: 'Clock' },
  { key: 'weeklyReport', timeKey: 'weeklyReportTime', label: 'Weekly reflection', description: 'Shown on Sunday when your report is ready.', icon: 'Calendar' },
];

async function showTestNotification(): Promise<boolean> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const lock = storage.getPrivacyLock();
  const title = lock.hideNotificationDetails ? 'Aequimens reminder' : 'Reminder test';
  const body = lock.hideNotificationDetails ? 'Open Aequimens when you have a moment.' : 'Your reminders are ready to use on this device.';
  const registration = await navigator.serviceWorker?.ready.catch(() => null);

  if (registration) {
    await registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'aequimens-test-reminder',
    });
  } else {
    new Notification(title, { body, icon: '/icons/icon-192.png' });
  }
  return true;
}

export function ReminderCenterPage() {
  const { prefs, save } = usePreferences();
  const { profile } = useProfile();
  const { show } = useToast();
  const enabledCount = RULES.filter((rule) => prefs.notifications[rule.key]).length;
  const [permission, setPermission] = useState<string>('Notification' in window ? Notification.permission : 'unsupported');

  const updateEnabled = (key: NotificationBooleanKey, value: boolean) => {
    save({ ...prefs, notifications: { ...prefs.notifications, [key]: value } });
  };
  const updateTime = (key: NotificationTimeKey, value: string) => {
    save({ ...prefs, notifications: { ...prefs.notifications, [key]: value } });
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      show('Notifications are not supported by this browser', 'info');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    show(result === 'granted' ? 'Notification permission enabled' : 'Notification permission was not enabled', result === 'granted' ? 'success' : 'info');
  };

  const testReminder = async () => {
    const sent = await showTestNotification();
    show(sent ? 'Test reminder sent' : 'Enable notification permission first', sent ? 'success' : 'info');
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Reminder centre</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Keep reminders useful, not noisy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">Choose only the prompts that genuinely help. Habit and routine reminders use the times set on those items.</p>
      </header>

      {enabledCount >= 5 && (
        <div className="mb-5 flex gap-3 rounded-2xl border border-olive-soft/50 bg-olive-tint/50 p-4">
          <Icon name="Bell" size={18} className="mt-0.5 shrink-0 text-olive-primary" />
          <div>
            <p className="text-sm font-semibold text-ink">You have {enabledCount} reminders enabled</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">Too many prompts can become easy to ignore. Keeping two or three usually works better.</p>
          </div>
        </div>
      )}

      <section className="premium-card overflow-hidden">
        {RULES.map((rule, index) => (
          <div key={rule.key} className={`grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center ${index > 0 ? 'border-t border-silver/60' : ''}`}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary"><Icon name={rule.icon} size={18} /></span>
              <div>
                <p className="text-sm font-semibold text-ink">{rule.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{rule.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <input type="time" value={prefs.notifications[rule.timeKey] as string} onChange={(event) => updateTime(rule.timeKey, event.target.value)} disabled={!prefs.notifications[rule.key]} className="rounded-xl border border-silver bg-white px-2.5 py-2 text-sm text-ink disabled:opacity-40" />
              <button type="button" role="switch" aria-checked={prefs.notifications[rule.key] as boolean} onClick={() => updateEnabled(rule.key, !(prefs.notifications[rule.key] as boolean))} className={`relative h-7 w-12 rounded-full transition-colors ${prefs.notifications[rule.key] ? 'bg-olive-primary' : 'bg-silver'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${prefs.notifications[rule.key] ? 'left-6' : 'left-1'}`} /></button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-3xl border border-silver bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Device notification permission</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">Current status: <strong className="text-ink">{permission}</strong>. Phone power-saving settings may delay browser reminders when the app is fully closed.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void requestPermission()} className="btn-secondary !px-4 !py-2.5 text-sm"><Icon name="Bell" size={16} /> Enable</button>
            <button onClick={() => void testReminder()} className="btn-primary !px-4 !py-2.5 text-sm"><Icon name="BellRing" size={16} /> Test</button>
          </div>
        </div>
      </section>

      {profile && (
        <p className="mt-4 text-center text-xs text-ink-soft">Your usual wake time is {profile.wakeTime} and sleep time is {profile.sleepTime}. You can edit these in Profile.</p>
      )}
    </div>
  );
}
