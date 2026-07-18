import { useNavigate } from 'react-router-dom';
import {
  useAchievements,
  useCheckIns,
  useHistory,
  useStreak,
  useTodaysMissions,
} from '../hooks';
import { WellnessScoreRing } from '../components/WellnessScoreRing';
import { MissionCard } from '../components/MissionCard';
import { TrendChart } from '../components/TrendChart';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { greeting, formatLongDate, todayISO } from '../utils/format';
import { categoryLabel } from '../engine/scoring';
import { MIN_DAYS_FOR_TRENDS } from '../config';

export function DashboardPage() {
  const navigate = useNavigate();
  const today = todayISO();
  const { checkIns } = useCheckIns();
  const { set, update, replace } = useTodaysMissions(today);
  const { history } = useHistory();
  const { streak } = useStreak();
  const { achievements } = useAchievements();

  const todayCheckIn = checkIns.find((checkIn) => checkIn.date === today) ?? null;
  const todaysSummary = history.find((day) => day.date === today) ?? null;
  const hasTodayData = todayCheckIn !== null || todaysSummary !== null;
  const score = todayCheckIn?.overall ?? todaysSummary?.overall ?? 0;
  const missions = set?.missions ?? todayCheckIn?.missions ?? [];
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const last7 = history.slice(-7);

  const earnedAchievements = achievements.filter((achievement) => achievement.earned);
  const recentAchievement = earnedAchievements[earnedAchievements.length - 1] ?? null;
  const topContributor = todayCheckIn?.contributors.find(
    (contributor) => contributor.impact === 'high' && contributor.direction === 'negative',
  );

  const trendDaysRemaining = Math.max(0, MIN_DAYS_FOR_TRENDS - history.length);

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

      {history.length === 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-olive-soft/40 bg-olive-tint/40 p-4">
          <Icon name="Sparkles" size={18} className="mt-0.5 shrink-0 text-olive-primary" />
          <p className="text-sm leading-relaxed text-olive-deep">
            Welcome to Aequimens. Complete your first check-in to unlock your personalised snapshot,
            missions, and wellness insights.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="premium-card flex flex-col items-center p-6 lg:col-span-1">
          <h2 className="mb-1 self-start text-sm font-semibold text-ink">Current wellness</h2>
          {hasTodayData ? (
            <WellnessScoreRing score={score} size={170} label="Today" />
          ) : (
            <div className="flex flex-col items-center justify-center py-5 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
                <Icon name="Sparkles" size={26} />
              </div>
              <p className="text-sm font-semibold text-ink">No data yet</p>
              <p className="mt-1 max-w-[180px] text-xs leading-relaxed text-ink-soft">
                Complete today's check-in to see your wellness score.
              </p>
            </div>
          )}
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
              <p className="mt-1 text-2xl font-bold text-olive-deep">
                {completedMissions}/{missions.length}
              </p>
              <p className="text-[11px] text-ink-soft">today</p>
            </div>
          </div>
        </section>

        <section className="premium-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-ink">Mood & energy summary</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(['mood', 'energy', 'stress', 'sleep'] as const).map((category) => {
              const raw = todayCheckIn?.domainScores[category] ?? todaysSummary?.[category];
              const value = typeof raw === 'number' ? raw : null;
              return (
                <div key={category} className="rounded-2xl border border-silver bg-white p-3">
                  <p className="text-xs text-ink-soft">{categoryLabel(category)}</p>
                  <p className="mt-1 text-xl font-bold text-ink">{value === null ? '—' : value}</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-silver-light">
                    <div
                      className="h-full rounded-full bg-olive-soft"
                      style={{ width: `${value ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-ink">Stress trend</h3>
          {history.length < MIN_DAYS_FOR_TRENDS ? (
            <p className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-4 text-center text-xs leading-relaxed text-ink-soft">
              Complete {trendDaysRemaining} more check-in day{trendDaysRemaining === 1 ? '' : 's'} to
              see your stress trend.
            </p>
          ) : (
            <>
              <TrendChart
                data={last7}
                dataKey="stress"
                label="Stress"
                color="#888E8B"
                type="line"
                domain={[0, 100]}
                invert
              />
              <p className="mt-1 text-[11px] text-ink-soft">Lower values indicate less tension.</p>
            </>
          )}
        </section>

        <section className="premium-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Today's missions</h2>
            <button
              onClick={() => navigate('/missions')}
              className="text-xs font-medium text-olive-primary hover:text-olive-deep"
            >
              View all
            </button>
          </div>
          {missions.length === 0 ? (
            <EmptyState
              icon="ListChecks"
              title="No missions yet"
              description="Complete a check-in to receive three personalised missions."
              action={
                <button onClick={() => navigate('/check-in')} className="btn-primary">
                  Begin check-in
                </button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onToggle={() => update(mission.id, { completed: !mission.completed })}
                  onReplace={(replacement) => replace(mission.id, replacement)}
                  onEdit={(name) => update(mission.id, { name })}
                  contributors={todayCheckIn?.contributors ?? []}
                />
              ))}
            </div>
          )}
        </section>

        <section className="premium-card p-6 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-ink">Weekly progress</h2>
          {history.length < MIN_DAYS_FOR_TRENDS ? (
            <p className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-4 text-center text-xs leading-relaxed text-ink-soft">
              Complete {trendDaysRemaining} more check-in day{trendDaysRemaining === 1 ? '' : 's'} to
              see your weekly progress.
            </p>
          ) : (
            <TrendChart
              data={last7}
              dataKey="overall"
              label="Score"
              color="#667A3E"
              type="area"
              domain={[0, 100]}
            />
          )}
          <div className="mt-5 border-t border-silver/60 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Recent achievement
            </p>
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
              <p className="text-xs text-ink-soft">
                Complete a few more days to earn your first achievement.
              </p>
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

      {topContributor && (
        <div className="mt-6 rounded-2xl border border-silver bg-white p-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Today's top contributor
          </p>
          <p className="text-sm text-ink">
            {topContributor.label}
            {' — '}
            <span className="text-ink-soft">{topContributor.detail}</span>
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
