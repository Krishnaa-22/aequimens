import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { storage } from '../data/localStorage';
import { formatLongDate } from '../utils/format';

interface LocalSearchItem {
  id: string;
  type: string;
  title: string;
  detail: string;
  date?: string;
  icon: string;
  to: string;
  searchText: string;
}

function buildSearchIndex(): LocalSearchItem[] {
  const items: LocalSearchItem[] = [];

  storage.getJournalEntries().forEach((entry) => {
    items.push({
      id: `journal-${entry.id}`,
      type: 'Journal',
      title: entry.text.slice(0, 72) || 'Journal entry',
      detail: [...entry.contextTags, ...entry.whatHelped].join(' · ') || 'Private reflection',
      date: entry.date,
      icon: 'NotebookPen',
      to: '/app/journal',
      searchText: [entry.text, ...entry.contextTags, ...entry.whatHelped].join(' '),
    });
  });

  storage.getContextMarkers().forEach((marker) => {
    items.push({
      id: `context-${marker.id}`,
      type: 'Context',
      title: marker.label,
      detail: marker.note || marker.type,
      date: marker.startDate,
      icon: 'Calendar',
      to: '/app/timeline',
      searchText: `${marker.label} ${marker.note ?? ''} ${marker.type}`,
    });
  });

  storage.getCheckIns().forEach((entry) => {
    const answerText = Object.values(entry.answers).map((answer) => answer.label).join(' ');
    items.push({
      id: `checkin-${entry.date}`,
      type: 'Check-in',
      title: `Wellness check-in · ${entry.overall}/100`,
      detail: entry.explanation,
      date: entry.date,
      icon: 'Sparkles',
      to: '/app/progress',
      searchText: `${entry.explanation} ${entry.contributors.map((item) => `${item.label} ${item.detail}`).join(' ')} ${answerText}`,
    });
  });

  storage.getMorningCheckIns().forEach((entry) => {
    items.push({
      id: `morning-${entry.date}`,
      type: 'Morning',
      title: entry.focus || 'Morning check-in',
      detail: `Sleep ${entry.sleepQuality}/5 · Energy ${entry.morningEnergy}/5`,
      date: entry.date,
      icon: 'Sunrise',
      to: '/app/timeline',
      searchText: `${entry.focus} sleep energy morning`,
    });
  });

  storage.getEveningCheckIns().forEach((entry) => {
    items.push({
      id: `evening-${entry.date}`,
      type: 'Evening',
      title: entry.reflection?.slice(0, 72) || 'Evening reflection',
      detail: [...entry.whatHelped, ...entry.whatWasHard].join(' · ') || `Mood ${entry.mood}/5`,
      date: entry.date,
      icon: 'MoonStar',
      to: '/app/timeline',
      searchText: `${entry.reflection ?? ''} ${entry.whatHelped.join(' ')} ${entry.whatWasHard.join(' ')}`,
    });
  });

  storage.getHabits().forEach((habit) => {
    items.push({
      id: `habit-${habit.id}`,
      type: 'Habit',
      title: habit.title,
      detail: `${habit.target} · ${habit.active ? 'Active' : 'Paused'}`,
      icon: 'CheckCircle',
      to: '/app/habits',
      searchText: `${habit.title} ${habit.target} ${habit.category ?? ''}`,
    });
  });

  storage.getGoals().forEach((goal) => {
    items.push({
      id: `goal-${goal.id}`,
      type: 'Goal',
      title: goal.title,
      detail: goal.target,
      date: goal.createdAt.slice(0, 10),
      icon: 'Target',
      to: '/app/goals',
      searchText: `${goal.title} ${goal.target} ${goal.category}`,
    });
  });

  storage.getRoutines().forEach((routine) => {
    items.push({
      id: `routine-${routine.id}`,
      type: 'Routine',
      title: routine.name,
      detail: routine.items.map((item) => item.title).join(' · '),
      date: routine.createdAt.slice(0, 10),
      icon: 'ListTodo',
      to: '/app/routines',
      searchText: `${routine.name} ${routine.items.map((item) => item.title).join(' ')}`,
    });
  });

  return items;
}

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const index = useMemo(buildSearchIndex, []);
  const normalised = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalised) return [];
    const terms = normalised.split(/\s+/).filter(Boolean);
    return index
      .filter((item) => {
        const haystack = `${item.title} ${item.detail} ${item.type} ${item.searchText}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
      .slice(0, 80);
  }, [index, normalised]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Private search</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Find something from your journey</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Search happens entirely on this device across reflections, context, check-ins, habits, goals, and routines.
        </p>
      </header>

      <div className="sticky top-3 z-20 rounded-3xl border border-silver bg-white/95 p-3 shadow-soft-lg backdrop-blur-md">
        <div className="flex items-center gap-3 rounded-2xl bg-silver-light/45 px-4 py-3">
          <Icon name="Search" size={19} className="shrink-0 text-olive-primary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “exam sleep”, “outdoor walk”, or “high stress”"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-silver-dark"
          />
          {query && (
            <button onClick={() => setQuery('')} className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-soft hover:bg-white" aria-label="Clear search">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      </div>

      {!normalised ? (
        <section className="mt-6 rounded-3xl border border-dashed border-silver bg-white/55 p-8 text-center">
          <Icon name="FileSearch" size={28} className="mx-auto text-olive-primary" />
          <h2 className="mt-3 text-base font-bold text-ink">Search your own records</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">Nothing leaves your device, and search history is not stored.</p>
        </section>
      ) : results.length === 0 ? (
        <section className="mt-6 rounded-3xl border border-dashed border-silver bg-white/55 p-8 text-center">
          <Icon name="Search" size={28} className="mx-auto text-olive-primary" />
          <h2 className="mt-3 text-base font-bold text-ink">No matching records</h2>
          <p className="mt-2 text-sm text-ink-soft">Try a shorter phrase or a different word.</p>
        </section>
      ) : (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">{results.length} result{results.length === 1 ? '' : 's'}</p>
            <p className="text-xs text-ink-soft">Stored locally</p>
          </div>
          <div className="space-y-3">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.to)}
                className="flex w-full items-start gap-4 rounded-3xl border border-silver bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-olive-soft/60 hover:shadow-soft-lg"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
                  <Icon name={item.icon} size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-olive-primary">{item.type}</span>
                    {item.date && <span className="text-[10px] text-ink-soft">{formatLongDate(item.date)}</span>}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-ink">{item.title}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-ink-soft">{item.detail}</span>
                </span>
                <Icon name="ChevronRight" size={16} className="mt-2 shrink-0 text-silver-dark" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
