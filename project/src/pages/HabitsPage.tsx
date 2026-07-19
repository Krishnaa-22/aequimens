import { useState } from 'react';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/Feedback';
import { useHabits, useToast } from '../hooks';
import { todayISO } from '../utils/format';
import type { Habit, HabitDifficulty, WeekdayIndex } from '../types';

const DAY_LABELS: { index: WeekdayIndex; short: string }[] = [
  { index: 1, short: 'M' },
  { index: 2, short: 'T' },
  { index: 3, short: 'W' },
  { index: 4, short: 'T' },
  { index: 5, short: 'F' },
  { index: 6, short: 'S' },
  { index: 0, short: 'S' },
];

const DIFFICULTY_LABEL: Record<HabitDifficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const CATEGORY_OPTIONS = ['custom', 'sleep', 'hydration', 'activity', 'screen', 'outdoor', 'social', 'meals', 'routine'] as const;

function emptyDraft(): Omit<Habit, 'id' | 'createdAt'> {
  return {
    title: '',
    category: 'custom',
    target: '',
    reminderTime: '',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    difficulty: 'easy',
    active: true,
    icon: 'ListChecks',
  };
}

function HabitForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Habit;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Omit<Habit, 'id' | 'createdAt'>>(
    initial ? { ...initial } : emptyDraft(),
  );

  const toggleDay = (day: WeekdayIndex) => {
    setDraft((d) => ({
      ...d,
      daysOfWeek: d.daysOfWeek.includes(day) ? d.daysOfWeek.filter((x) => x !== day) : [...d.daysOfWeek, day],
    }));
  };

  const canSave = draft.title.trim().length > 0 && draft.target.trim().length > 0 && draft.daysOfWeek.length > 0;

  return (
    <div className="premium-card mb-6 p-5 animate-fadeIn">
      <h2 className="mb-4 text-sm font-semibold text-ink">{initial ? 'Edit habit' : 'New habit'}</h2>

      <label className="mb-3 block text-xs font-medium text-ink-soft">
        Title
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="e.g. Stretch after waking up"
          maxLength={60}
          className="mt-1 w-full rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </label>

      <label className="mb-3 block text-xs font-medium text-ink-soft">
        Target
        <input
          type="text"
          value={draft.target}
          onChange={(e) => setDraft((d) => ({ ...d, target: e.target.value }))}
          placeholder="e.g. 10 minutes, 3 glasses…"
          maxLength={40}
          className="mt-1 w-full rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </label>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="block text-xs font-medium text-ink-soft">
          Category
          <select
            value={draft.category ?? 'custom'}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Habit['category'] }))}
            className="mt-1 w-full rounded-2xl border border-silver bg-white px-3 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-ink-soft">
          Difficulty
          <select
            value={draft.difficulty}
            onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value as HabitDifficulty }))}
            className="mt-1 w-full rounded-2xl border border-silver bg-white px-3 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
          >
            {(['easy', 'medium', 'hard'] as HabitDifficulty[]).map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABEL[d]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mb-4 block text-xs font-medium text-ink-soft">
        Reminder time (optional)
        <input
          type="time"
          value={draft.reminderTime ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, reminderTime: e.target.value }))}
          className="mt-1 w-full rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </label>

      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-ink-soft">Days of week</p>
        <div className="flex gap-1.5">
          {DAY_LABELS.map(({ index, short }) => (
            <button
              key={index}
              type="button"
              onClick={() => toggleDay(index)}
              className={`h-9 w-9 rounded-full text-xs font-semibold transition-all ${
                draft.daysOfWeek.includes(index)
                  ? 'bg-olive-primary text-white shadow-soft'
                  : 'border border-silver bg-white text-ink-soft'
              }`}
            >
              {short}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={() => canSave && onSave(draft)} disabled={!canSave} className="btn-primary flex-1">
          <Icon name="Check" size={16} /> Save habit
        </button>
      </div>
    </div>
  );
}


export function HabitsPage() {
  const { habits, save, remove, toggleLog, isCompleted, missedStreak } = useHabits();
  const { show } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = todayISO();
  const todayWeekday = new Date().getDay() as WeekdayIndex;

  const active = habits.filter((h) => h.active);
  const paused = habits.filter((h) => !h.active);

  const handleSave = (draft: Omit<Habit, 'id' | 'createdAt'>) => {
    const habit: Habit = editing
      ? { ...editing, ...draft }
      : { ...draft, id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() };
    save(habit);
    show(editing ? 'Habit updated' : 'Habit created', 'success');
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Custom habits</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Your own daily habits</h1>
          <p className="mt-1.5 text-sm text-ink-soft">These sit alongside your generated missions.</p>
        </div>
        {!formOpen && (
          <button onClick={() => setFormOpen(true)} className="btn-primary shrink-0 !px-4 !py-2.5 text-sm">
            <Icon name="Plus" size={16} /> New
          </button>
        )}
      </header>

      {formOpen && (
        <HabitForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}

      {habits.length === 0 && !formOpen ? (
        <EmptyState
          icon="ListChecks"
          title="No custom habits yet"
          description="Create your own daily habit with a target, schedule, and difficulty."
          action={
            <button onClick={() => setFormOpen(true)} className="btn-primary">
              <Icon name="Plus" size={16} /> Create your first habit
            </button>
          }
        />
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-6 space-y-2.5">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">Active today</h2>
              {active
                .filter((h) => h.daysOfWeek.includes(todayWeekday))
                .map((h) => (
                  <HabitCard
                    key={h.id}
                    habit={h}
                    completedToday={isCompleted(h.id, today)}
                    onToggle={() => toggleLog(h.id, today, !isCompleted(h.id, today))}
                    onEdit={() => {
                      setEditing(h);
                      setFormOpen(true);
                    }}
                    onPause={() => save({ ...h, active: false })}
                    onDelete={() => remove(h.id)}
                    missedDays={missedStreak(h.id, today)}
                    onMakeGentler={() => save({ ...h, target: gentlerTarget(h), difficulty: 'easy' })}
                  />
                ))}
              {active
                .filter((h) => !h.daysOfWeek.includes(todayWeekday))
                .map((h) => (
                  <HabitCard
                    key={h.id}
                    habit={h}
                    notScheduledToday
                    completedToday={false}
                    onToggle={() => {}}
                    onEdit={() => {
                      setEditing(h);
                      setFormOpen(true);
                    }}
                    onPause={() => save({ ...h, active: false })}
                    onDelete={() => remove(h.id)}
                  />
                ))}
            </section>
          )}

          {paused.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-soft">Paused</h2>
              {paused.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  paused
                  completedToday={false}
                  onToggle={() => {}}
                  onEdit={() => {
                    setEditing(h);
                    setFormOpen(true);
                  }}
                  onPause={() => save({ ...h, active: true })}
                  onDelete={() => remove(h.id)}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

function HabitCard({
  habit,
  completedToday,
  onToggle,
  onEdit,
  onPause,
  onDelete,
  paused,
  notScheduledToday,
  missedDays = 0,
  onMakeGentler,
}: {
  habit: Habit;
  completedToday: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onPause: () => void;
  onDelete: () => void;
  paused?: boolean;
  notScheduledToday?: boolean;
  missedDays?: number;
  onMakeGentler?: () => void;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-2xl border-l-4 bg-white p-4 shadow-soft transition-all ${
          paused ? 'border-l-silver-dark opacity-60' : 'border-l-olive-soft'
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          disabled={paused || notScheduledToday}
          aria-label={completedToday ? 'Mark as not done' : 'Mark as done'}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
            completedToday
              ? 'border-olive-primary bg-olive-primary text-white'
              : 'border-silver text-transparent hover:border-olive-soft/70'
          } ${paused || notScheduledToday ? 'cursor-not-allowed' : ''}`}
        >
          <Icon name="Check" size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink">{habit.title}</p>
            <span className="chip !py-0.5 !px-2 border-olive-soft/40 bg-olive-tint/50 text-[10px] text-olive-deep">Custom</span>
          </div>
          <p className="mt-0.5 text-xs text-ink-soft">
            {habit.target}
            {habit.reminderTime ? ` · reminder ${habit.reminderTime}` : ''}
            {notScheduledToday ? ' · not scheduled today' : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button onClick={onEdit} aria-label="Edit habit" className="rounded-lg p-2 text-ink-soft hover:bg-silver-light/60 hover:text-ink">
            <Icon name="Pencil" size={16} />
          </button>
          <button onClick={onPause} aria-label={paused ? 'Resume habit' : 'Pause habit'} className="rounded-lg p-2 text-ink-soft hover:bg-silver-light/60 hover:text-ink">
            <Icon name={paused ? 'Play' : 'Pause'} size={16} />
          </button>
          <button onClick={onDelete} aria-label="Delete habit" className="rounded-lg p-2 text-ink-soft hover:bg-silver-light/60 hover:text-olive-deep">
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      {missedDays >= 4 && !paused && !notScheduledToday && onMakeGentler && (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-olive-soft/40 bg-olive-tint/45 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-olive-deep">This habit may be too demanding right now</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">You have missed it for {missedDays} recent days. A smaller target can protect consistency without guilt.</p>
          </div>
          <button type="button" onClick={onMakeGentler} className="btn-secondary shrink-0 !px-3 !py-2 text-xs">Make gentler</button>
        </div>
      )}
    </div>
  );
}

function gentlerTarget(habit: Habit): string {
  switch (habit.category) {
    case 'activity': return '10 minutes';
    case 'hydration': return '2 glasses';
    case 'sleep': return '15 minutes earlier';
    case 'screen': return '15 minutes less';
    case 'outdoor': return '5 minutes';
    case 'social': return 'Send one message';
    case 'meals': return 'One regular meal';
    default: return 'A smaller version';
  }
}
