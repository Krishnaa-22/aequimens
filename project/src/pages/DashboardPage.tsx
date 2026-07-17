import { useNavigate } from 'react-router-dom';
import { useCheckIns, useTodaysMissions, useHistory, useStreak } from '../hooks';
import { WellnessScoreRing } from '../components/WellnessScoreRing';
import { MissionCard } from '../components/MissionCard';
import { TrendChart } from '../components/TrendChart';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { greeting, formatLongDate, todayISO } from '../utils/format';
import { categoryLabel } from '../engine/scoring';

export function DashboardPage() {
  const navigate = useNavigate();
  const { latest } = useCheckIns();
  const { set, update, replace } = useTodaysMissions(todayISO());
  const { history } = useHistory();
  const { streak } = useStreak();

  const last7 = history.slice(-7);
  const today = todayISO();
  const todaysSummary = history.find((d) => d.date === today);
  const score = latest?.overall ?? todaysSummary?.overall ?? 0;
  const missions = set?.missions ?? latest?.missions ?? [];
  const completedMissions = missions.filter((m) => m.completed).length;

  const recentAchievement = (() => {
    const stored = localStorage.getItem('aequimens.achievements');
    if (!stored) return null;
    try {
      const list = JSON.parse(stored) as { earned: boolean; name: string; icon: string; description?: string }[];
      const earned = list.filter((a) => a.earned);
      return earned[earned.length - 1] ?? null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-soft">{formatLongDate(today)}</p>
          <h1 className="mt-0.5 text-2xl font-bold text-ink md:text-3xl">{greeting()}.</h1>
        </div>
        <button onClick={() => navigate('/check-in')} className="btn-primary self-start sm:self-auto">
          <Icon name="Sparkles" size={18} />
          Quick check-in
        </button>
      </header>

      {!latest && history.length <= 7 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-olive-soft/40 bg-olive-tint/40 p-4">
          <Icon name="Sparkles" size={18} className="mt-0.5 shrink-0 text-olive-primary" />
          <p className="text-sm leading-relaxed text-olive-deep">
            Welcome to Aequimens. Complete your first check-in to unlock your personalised snapshot and missions.
            Your charts already show a sample week so you can explore the app.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="premium-card flex flex-col items-center p-6 lg:col-span-1">
          <h2 className="mb-1 self-start text-sm font-semibold text-ink">Current wellness</h2>
          <WellnessScoreRing score={score} size={170} label="Today" />
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl border border-silver bg-silver-light/40 p-3 text-center">
              <p className="flex items-center justify-center gap-1 text-xs text-ink-soft">
                <Icon name="TrendingUp" size={13} /> Streak
              </p>
              <p className="mt-1 text-2xl font-bold text-olive-deep">{streak}</p>
              <p className="text-[11px] text-ink-soft">day{streak === 1 ? '' : 's'}</p>
            </div>
            <div className="rounded-2xl border border-silver bg-silver-light/40 p-3 text-center">
              <p className="flex items-center justify-center gap-1 text-xs text-ink-soft">
                <Icon name="ListChecks" size={13} /> Missions
              </p>
              <p className="mt-1 text-2xl font-bold text-olive-deep">{completedMissions}/{missions.length}</p>
              <p className="text-[11px] text-ink-soft">today</p>
            </div>
          </div>
        </section>

        <section className="premium-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-ink">Mood & energy summary</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['mood', 'energy', 'stress', 'sleep'] as const).map((cat) => {
              const val = latest?.domainScores[cat] ?? todaysSummary?.[cat] ?? 0;
              return (
                <div key={cat} className="rounded-2xl border border-silver bg-white p-3">
                  <p className="text-xs text-ink-soft">{categoryLabel(cat)}</p>
                  <p className="mt-1 text-xl font-bold text-ink">{val}</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-silver-light">
                    <div className="h-full rounded-full bg-olive-soft" style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-ink">Stress trend</h3>
          <TrendChart data={last7} dataKey="stress" label="Stress" color="#888E8B" type="line" domain={[0, 100]} invert />
          <p className="mt-1 text-[11px] text-ink-soft">Lower values indicate less tension.</p>
        </section>

        <section className="premium-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Today's missions</h2>
            <button onClick={() => navigate('/missions')} className="text-xs font-medium text-olive-primary hover:text-olive-deep">
              View all
            </button>
          </div>
          {missions.length === 0 ? (
            <EmptyState
              icon="ListChecks"
              title="No missions yet"
              description="Complete a check-in to receive three personalised missions."
              action={<button onClick={() => navigate('/check-in')} className="btn-primary">Begin check-in</button>}
            />
          ) : (
            <div className="space-y-2.5">
              {missions.map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  onToggle={() => update(m.id, { completed: !m.completed })}
                  onReplace={(rep) => replace(m.id, rep)}
                  onEdit={(name) => update(m.id, { name })}
                  contributors={latest?.contributors ?? []}
                />
              ))}
            </div>
          )}
        </section>

        <section className="premium-card p-6 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-ink">Weekly progress</h2>
          <TrendChart data={last7} dataKey="overall" label="Score" color="#667A3E" type="area" domain={[0, 100]} />
          <div className="mt-5 border-t border-silver/60 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Recent achievement</p>
            {recentAchievement ? (
              <div className="flex items-center gap-3 rounded-2xl bg-olive-tint/40 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-shine text-white">
                  <Icon name={recentAchievement.icon} size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{recentAchievement.name}</p>
                  <p className="text-[11px] text-ink-soft">{recentAchievement.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-soft">Complete a few more days to earn your first achievement.</p>
            )}
            <button
              onClick={() => navigate('/insights')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-olive-primary hover:text-olive-deep"
            >
              See all achievements <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        </section>
      </div>

      {latest && latest.contributors.filter((c) => c.impact === 'high' && c.direction === 'negative').length > 0 && (
        <div className="mt-6 rounded-2xl border border-silver bg-white p-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">Today's top contributor</p>
          <p className="text-sm text-ink">
            {latest.contributors.find((c) => c.impact === 'high' && c.direction === 'negative')?.label}
            {' — '}
            <span className="text-ink-soft">
              {latest.contributors.find((c) => c.impact === 'high' && c.direction === 'negative')?.detail}
            </span>
          </p>
        </div>
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
