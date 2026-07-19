import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/Feedback';
import {
  useCheckIns,
  useMorningCheckIns,
  useEveningCheckIns,
  useHabits,
  useAchievements,
  useContextMarkers,
  useToast,
  useJournal,
  useRoutines,
} from '../hooks';
import { formatLongDate, localDateISO, todayISO } from '../utils/format';
import type { ContextMarkerType, TimelineEntry } from '../types';

const CONTEXT_TYPES: { type: ContextMarkerType; label: string; icon: string }[] = [
  { type: 'exam', label: 'Exam week', icon: 'GraduationCap' },
  { type: 'travel', label: 'Travel', icon: 'Compass' },
  { type: 'family', label: 'Family issue', icon: 'HeartHandshake' },
  { type: 'deadline', label: 'Deadline', icon: 'Briefcase' },
  { type: 'social', label: 'Social event', icon: 'Users' },
  { type: 'custom', label: 'Custom', icon: 'MoreHorizontal' },
];

function AddContextForm({ onClose }: { onClose: () => void }) {
  const { save } = useContextMarkers();
  const { show } = useToast();
  const [type, setType] = useState<ContextMarkerType>('deadline');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState(1);

  const submit = () => {
    const start = todayISO();
    const startDate = new Date();
    const end = new Date(startDate);
    end.setDate(end.getDate() + Math.max(0, days - 1));
    save({
      id: `context_${Date.now()}`,
      type,
      label: label.trim() || CONTEXT_TYPES.find((c) => c.type === type)?.label || 'Context',
      startDate: start,
      endDate: localDateISO(end),
      createdAt: new Date().toISOString(),
    });
    show('Context marker added', 'success');
    onClose();
  };

  return (
    <div className="premium-card mb-6 p-5 animate-fadeIn">
      <h2 className="mb-4 text-sm font-semibold text-ink">Add a context marker</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        {CONTEXT_TYPES.map((c) => (
          <button
            key={c.type}
            onClick={() => setType(c.type)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              type === c.type ? 'border-olive-primary bg-olive-tint text-olive-deep' : 'border-silver bg-white text-ink-soft'
            }`}
          >
            <Icon name={c.icon} size={13} /> {c.label}
          </button>
        ))}
      </div>
      <label className="mb-3 block text-xs font-medium text-ink-soft">
        Note (optional)
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Finals for statistics"
          maxLength={60}
          className="mt-1 w-full rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </label>
      <label className="mb-4 block text-xs font-medium text-ink-soft">
        How many days?
        <input
          type="number"
          min={1}
          max={30}
          value={days}
          onChange={(e) => setDays(Number(e.target.value) || 1)}
          className="mt-1 w-24 rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </label>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={submit} className="btn-primary flex-1">
          <Icon name="Check" size={16} /> Add marker
        </button>
      </div>
    </div>
  );
}

export function TimelinePage() {
  const { checkIns } = useCheckIns();
  const { entries: morningEntries } = useMorningCheckIns();
  const { entries: eveningEntries } = useEveningCheckIns();
  const { habits, logs } = useHabits();
  const { achievements } = useAchievements();
  const { markers, remove } = useContextMarkers();
  const { entries: journalEntries } = useJournal();
  const { routines, logs: routineLogs } = useRoutines();
  const [addingContext, setAddingContext] = useState(false);

  const entries: TimelineEntry[] = useMemo(() => {
    const list: TimelineEntry[] = [];

    checkIns.forEach((c) =>
      list.push({
        id: `checkin_${c.date}`,
        date: c.date,
        type: 'check-in',
        title: 'Daily check-in completed',
        detail: `Overall wellness ${c.overall}/100`,
        icon: 'Sparkles',
      }),
    );

    morningEntries.forEach((m) =>
      list.push({
        id: `morning_${m.date}`,
        date: m.date,
        type: 'morning',
        title: 'Morning check-in',
        detail: `Focus: ${m.focus}`,
        icon: 'Sunrise',
      }),
    );

    eveningEntries.forEach((e) =>
      list.push({
        id: `evening_${e.date}`,
        date: e.date,
        type: 'evening',
        title: 'Evening check-in',
        detail: e.whatHelped.length ? `Helped: ${e.whatHelped.join(', ')}` : undefined,
        icon: 'MoonStar',
      }),
    );

    logs
      .filter((l) => l.completed)
      .forEach((l) => {
        const habit = habits.find((h) => h.id === l.habitId);
        if (!habit) return;
        list.push({
          id: `habit_${l.habitId}_${l.date}`,
          date: l.date,
          type: 'habit',
          title: `Habit done: ${habit.title}`,
          icon: 'ListChecks',
        });
      });

    markers.forEach((m) =>
      list.push({
        id: `context_${m.id}`,
        date: m.startDate,
        type: 'context',
        title: `Context: ${m.label}`,
        detail: m.endDate && m.endDate !== m.startDate ? `${m.startDate} → ${m.endDate}` : undefined,
        icon: CONTEXT_TYPES.find((c) => c.type === m.type)?.icon ?? 'MoreHorizontal',
      }),
    );

    journalEntries.forEach((entry) =>
      list.push({
        id: `journal_${entry.id}`,
        date: entry.date,
        type: 'journal',
        title: 'Private journal entry',
        detail: entry.text.slice(0, 90),
        icon: 'NotebookPen',
      }),
    );

    routineLogs
      .filter((log) => log.completed)
      .forEach((log) => {
        const routine = routines.find((item) => item.id === log.routineId);
        const routineItem = routine?.items.find((item) => item.id === log.itemId);
        if (!routine || !routineItem) return;
        list.push({
          id: `routine_${log.routineId}_${log.itemId}_${log.date}`,
          date: log.date,
          type: 'routine',
          title: `${routine.name}: ${routineItem.title}`,
          icon: 'ListTodo',
        });
      });

    achievements
      .filter((a) => a.earned && a.earnedDate)
      .forEach((a) =>
        list.push({
          id: `achievement_${a.id}`,
          date: a.earnedDate as string,
          type: 'achievement',
          title: `Achievement: ${a.name}`,
          icon: a.icon,
        }),
      );

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [checkIns, morningEntries, eveningEntries, logs, habits, markers, achievements, journalEntries, routineLogs, routines]);

  const grouped = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};
    entries.forEach((e) => {
      groups[e.date] = groups[e.date] ? [...groups[e.date], e] : [e];
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Timeline</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Your wellness timeline</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Check-ins, habits, routines, journal entries, and context in one view.</p>
        </div>
        {!addingContext && (
          <button onClick={() => setAddingContext(true)} className="btn-secondary shrink-0 !px-4 !py-2.5 text-sm">
            <Icon name="Plus" size={16} /> Context
          </button>
        )}
      </header>

      {addingContext && <AddContextForm onClose={() => setAddingContext(false)} />}

      {grouped.length === 0 ? (
        <EmptyState
          icon="Calendar"
          title="Your timeline is empty"
          description="Once you check in, log habits, or complete missions, they'll appear here."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayEntries]) => (
            <section key={date}>
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {formatLongDate(date)}
              </h2>
              <div className="relative space-y-2 border-l-2 border-silver-light pl-4">
                {dayEntries.map((e) => (
                  <div key={e.id} className="group relative rounded-2xl border border-silver/70 bg-white p-3.5 shadow-soft">
                    <span className="absolute -left-[27px] top-4 h-3 w-3 rounded-full border-2 border-white bg-olive-primary" />
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary">
                        <Icon name={e.icon} size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{e.title}</p>
                        {e.detail && <p className="mt-0.5 text-xs text-ink-soft">{e.detail}</p>}
                      </div>
                      {e.type === 'context' && (
                        <button
                          onClick={() => remove(e.id.replace('context_', ''))}
                          aria-label="Remove context marker"
                          className="rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:text-olive-deep group-hover:opacity-100"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
