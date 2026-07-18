import { useNavigate } from 'react-router-dom';
import { useTodaysMissions, useCheckIns, useStreak } from '../hooks';
import { MissionCard } from '../components/MissionCard';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { todayISO } from '../utils/format';
import { replacementMission } from '../engine/recommendations';

export function MissionsPage() {
  const navigate = useNavigate();
  const today = todayISO();
  const { set, update, replace } = useTodaysMissions(today);
  const { checkIns } = useCheckIns();
  const { streak } = useStreak();
  const todayCheckIn = checkIns.find((checkIn) => checkIn.date === today) ?? null;

  const missions = set?.missions ?? [];
  const completed = missions.filter((m) => m.completed).length;
  const total = missions.length;
  const pct = total > 0 ? completed / total : 0;

  const message =
    total === 0
      ? 'Small improvements count.'
      : completed === total
        ? 'Every mission complete. Well done for showing up today.'
        : completed >= 2
          ? `Two of three missions completed. Consistency matters more than perfection.`
          : completed === 1
            ? 'One step taken. Small improvements count.'
            : 'Small improvements count.';

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Daily missions</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Small steps for today</h1>
      </header>

      {missions.length === 0 ? (
        <EmptyState
          icon="ListChecks"
          title="No missions yet today"
          description="Complete a check-in to receive three personalised, gentle missions."
          action={<button onClick={() => navigate('/check-in')} className="btn-primary">Begin check-in</button>}
        />
      ) : (
        <>
          {/* Completion ring */}
          <section className="premium-card mb-6 flex flex-col items-center p-6 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-sm font-medium text-ink-soft">Daily completion</p>
              <p className="mt-1 text-3xl font-bold text-olive-deep">
                {completed}/{total}
              </p>
              <p className="mt-1 max-w-xs text-center text-sm text-ink-soft sm:text-left">{message}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
                <Icon name="TrendingUp" size={14} className="text-olive-primary" />
                {streak} day streak — keep it gentle
              </div>
            </div>
            <div className="relative mt-5 sm:mt-0">
              <svg width={120} height={120} className="-rotate-90">
                <defs>
                  <linearGradient id="mission-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A7B77D" />
                    <stop offset="100%" stopColor="#3E4A27" />
                  </linearGradient>
                </defs>
                <circle cx={60} cy={60} r={52} fill="none" stroke="#E6E8E7" strokeWidth={11} />
                <circle
                  cx={60}
                  cy={60}
                  r={52}
                  fill="none"
                  stroke="url(#mission-ring)"
                  strokeWidth={11}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - pct)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-ink">{Math.round(pct * 100)}%</span>
              </div>
            </div>
          </section>

          {/* Mission list */}
          <section className="space-y-2.5">
            {missions.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                onToggle={() => update(m.id, { completed: !m.completed })}
                onReplace={(rep) => replace(m.id, rep)}
                onEdit={(name) => update(m.id, { name })}
                contributors={todayCheckIn?.contributors ?? []}
              />
            ))}
          </section>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-silver bg-silver-light/40 p-4">
            <p className="text-sm text-ink-soft">Need a different set of steps?</p>
            <button
              onClick={() => {
                const fresh = replacementMission(missions, todayCheckIn?.contributors ?? []);
                if (missions[0]) replace(missions[0].id, fresh);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-olive-primary hover:text-olive-deep"
            >
              <Icon name="RefreshCw" size={15} /> Replace one
            </button>
          </div>
        </>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/bad-day')}
          className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-olive-deep hover:underline"
        >
          I'm having a difficult day
        </button>
      </div>
    </div>
  );
}
