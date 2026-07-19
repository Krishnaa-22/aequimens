import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { EmptyState } from '../components/Feedback';
import { useHistory, useHabits } from '../hooks';
import { buildMonthlyStory } from '../engine/insights';
import { todayISO } from '../utils/format';

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function MonthlyStoryPage() {
  const { history } = useHistory();
  const { habits, logs } = useHabits();
  const currentMonth = todayISO().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  const story = useMemo(() => buildMonthlyStory(history, logs, habits, month), [history, logs, habits, month]);

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const date = new Date(y, (m ?? 1) - 1 + delta, 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Monthly story</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Your wellness story</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="rounded-lg p-2 text-ink-soft hover:bg-silver-light/60">
            <Icon name="ChevronLeft" size={18} />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            disabled={month >= currentMonth}
            aria-label="Next month"
            className="rounded-lg p-2 text-ink-soft hover:bg-silver-light/60 disabled:opacity-30"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>
      </header>

      <p className="mb-5 text-sm font-medium text-ink-soft">{monthLabel(month)}</p>

      {!story.hasEnoughData ? (
        <EmptyState
          icon="Calendar"
          title="Not enough data yet for this month"
          description="Keep checking in — your monthly story unlocks once there's enough real history to reflect on."
        />
      ) : (
        <div className="space-y-3">
          <div className="premium-card olive-shine p-6 text-white shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Highlight</p>
            <p className="mt-2 text-lg font-semibold leading-snug">{story.highlight}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <StoryCard icon="TrendingUp" label="Best week" value={story.bestWeekLabel ?? '—'} />
            <StoryCard icon="Sparkles" label="Top improvement" value={story.topImprovement ?? '—'} />
            <StoryCard icon="ListChecks" label="Strongest habit" value={story.strongestHabit ?? 'Not enough habit data yet'} />
            <StoryCard icon="AlertTriangle" label="Biggest challenge" value={story.biggestChallenge ?? '—'} />
          </div>

          <div className="premium-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Mission completion</p>
            <p className="mt-2 text-3xl font-bold text-olive-deep">{story.completionPercent ?? 0}%</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-silver-light">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${story.completionPercent ?? 0}%`, background: 'linear-gradient(90deg, #9BAE70, #667A3E)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StoryCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="premium-card p-4">
      <div className="mb-1.5 flex items-center gap-2 text-olive-primary">
        <Icon name={icon} size={15} />
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      </div>
      <p className="text-sm leading-relaxed text-ink">{value}</p>
    </div>
  );
}
