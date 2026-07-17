import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences, useToast } from '../hooks';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Modal } from '../components/Modal';
import { Icon } from '../components/Icon';
import { storage } from '../data/localStorage';
import type { NotificationSettings } from '../types';
import { SAMPLE_NOTIFICATIONS } from '../data/mockData';
import { Wordmark } from '../components/LogoMark';

const NOTIF_FIELDS: { key: keyof NotificationSettings; label: string; example: string }[] = [
  { key: 'morningCheckIn', label: 'Morning check-in', example: SAMPLE_NOTIFICATIONS.morningCheckIn[0] },
  { key: 'waterReminder', label: 'Water reminder', example: SAMPLE_NOTIFICATIONS.waterReminder[0] },
  { key: 'outdoorReminder', label: 'Outdoor reminder', example: SAMPLE_NOTIFICATIONS.outdoorReminder[0] },
  { key: 'eveningReview', label: 'Evening mission review', example: SAMPLE_NOTIFICATIONS.eveningReview[0] },
  { key: 'sleepReminder', label: 'Sleep routine reminder', example: SAMPLE_NOTIFICATIONS.sleepReminder[0] },
  { key: 'weeklyReport', label: 'Weekly report', example: SAMPLE_NOTIFICATIONS.weeklyReport[0] },
];

const TIME_KEYS: { key: keyof NotificationSettings; label: string }[] = [
  { key: 'morningCheckInTime', label: 'Morning check-in time' },
  { key: 'waterReminderTime', label: 'Water reminder time' },
  { key: 'outdoorReminderTime', label: 'Outdoor reminder time' },
  { key: 'eveningReviewTime', label: 'Evening review time' },
  { key: 'sleepReminderTime', label: 'Sleep reminder time' },
  { key: 'weeklyReportTime', label: 'Weekly report time' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { prefs, save } = usePreferences();
  const { show } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const updateNotif = (key: keyof NotificationSettings, value: boolean | string) => {
    save({ ...prefs, notifications: { ...prefs.notifications, [key]: value } });
  };

  const exportData = () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aequimens-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show('Your data was exported', 'success');
  };

  const resetProgress = () => {
    storage.clearAll();
    setConfirmReset(false);
    show('Progress reset', 'success');
    setTimeout(() => navigate('/welcome'), 600);
  };

  const deleteAll = () => {
    storage.clearAll();
    setConfirmDelete(false);
    show('All local data deleted', 'success');
    setTimeout(() => navigate('/welcome'), 600);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Settings</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Settings & privacy</h1>
      </header>

      {/* Appearance */}
      <Section title="Appearance" icon="Sun">
        <Row label="Theme" description="Light theme keeps the app calm and clear.">
          <span className="chip border-silver bg-silver-light/60 text-ink-soft">
            <Icon name="Sun" size={13} /> Light
          </span>
        </Row>
        <Row label="Reduced motion" description="Minimise animations across the app.">
          <Toggle
            checked={prefs.reducedMotion}
            onChange={(v) => save({ ...prefs, reducedMotion: v })}
            label="Reduced motion"
          />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon="Bell">
        {NOTIF_FIELDS.map((f) => (
          <Row key={f.key} label={f.label} description={`“${f.example}”`}>
            <Toggle
              checked={prefs.notifications[f.key] as boolean}
              onChange={(v) => updateNotif(f.key, v)}
              label={f.label}
            />
          </Row>
        ))}
        <div className="mt-2 border-t border-silver/60 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Reminder times</p>
          {TIME_KEYS.map((t) => (
            <Row key={t.key} label={t.label} description="">
              <input
                type="time"
                value={prefs.notifications[t.key] as string}
                onChange={(e) => updateNotif(t.key, e.target.value)}
                className="rounded-lg border border-silver bg-white px-2.5 py-1.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
              />
            </Row>
          ))}
        </div>
      </Section>

      {/* Privacy & data */}
      <Section title="Your data" icon="Lock">
        <Row label="Export local data" description="Download a JSON copy of everything stored on this device.">
          <button onClick={exportData} className="btn-secondary !px-4 !py-2.5 text-sm">
            <Icon name="Download" size={16} /> Export
          </button>
        </Row>
        <Row label="Reset progress" description="Clears check-ins, missions, streaks, and history.">
          <button onClick={() => setConfirmReset(true)} className="btn-secondary !px-4 !py-2.5 text-sm">
            <Icon name="RefreshCw" size={16} /> Reset
          </button>
        </Row>
        <Row label="Delete all local data" description="Removes everything Aequimens has stored on this device.">
          <button onClick={() => setConfirmDelete(true)} className="rounded-2xl bg-olive-deep px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110">
            <Icon name="Trash2" size={16} /> Delete
          </button>
        </Row>
      </Section>

      {/* About / legal */}
      <Section title="About" icon="Info">
        <button onClick={() => setPrivacyOpen(true)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left hover:bg-silver-light/50">
          <span className="text-sm font-medium text-ink">Privacy policy</span>
          <Icon name="ChevronRight" size={18} className="text-ink-soft" />
        </button>
        <button onClick={() => navigate('/disclaimer')} className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left hover:bg-silver-light/50">
          <span className="text-sm font-medium text-ink">Wellness disclaimer</span>
          <Icon name="ChevronRight" size={18} className="text-ink-soft" />
        </button>
        <button onClick={() => setAboutOpen(true)} className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left hover:bg-silver-light/50">
          <span className="text-sm font-medium text-ink">About Aequimens</span>
          <Icon name="ChevronRight" size={18} className="text-ink-soft" />
        </button>
        <Row label="App version" description="">
          <span className="text-sm text-ink-soft">1.0.0</span>
        </Row>
      </Section>

      <ConfirmationDialog
        open={confirmReset}
        title="Reset your progress?"
        message="This will clear all check-ins, missions, streaks, and history. This cannot be undone."
        confirmLabel="Reset progress"
        destructive
        onConfirm={resetProgress}
        onCancel={() => setConfirmReset(false)}
      />
      <ConfirmationDialog
        open={confirmDelete}
        title="Delete all local data?"
        message="Everything Aequimens stored on this device will be removed. This cannot be undone."
        confirmLabel="Delete everything"
        destructive
        onConfirm={deleteAll}
        onCancel={() => setConfirmDelete(false)}
      />

      <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title="Privacy policy" size="lg">
        <div className="space-y-3 text-sm leading-relaxed text-ink-soft">
          <p><strong className="text-ink">No account required.</strong> You can use Aequimens fully without creating an account or providing an email.</p>
          <p><strong className="text-ink">Data stays on your device by default.</strong> All check-ins, missions, scores, streaks, and preferences are stored locally in your browser.</p>
          <p><strong className="text-ink">Cloud sync may come later.</strong> An optional, opt-in sync feature may be added in the future. It will never be enabled without your explicit consent.</p>
          <p><strong className="text-ink">You control deletion and export.</strong> Use Export to keep a copy, or Delete to remove everything at any time.</p>
          <p><strong className="text-ink">Not medical data.</strong> Aequimens stores general wellness reflections, not medical records or diagnoses.</p>
        </div>
      </Modal>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Aequimens" size="md">
        <div className="flex flex-col items-center text-center">
          <Wordmark size={16} className="text-ink" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Aequimens is a private daily check-in that helps you understand what may be shaping your mood,
            energy, stress, and everyday wellbeing. It provides general wellness insights and does not
            diagnose, treat, or replace medical or mental-health care.
          </p>
          <p className="mt-4 text-xs text-silver-dark">Version 1.0.0</p>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="premium-card mb-4 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon name={icon} size={17} className="text-olive-primary" />
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3 hover:bg-silver-light/40">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-olive-primary' : 'bg-silver'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}
