import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAchievements,
  useCheckIns,
  useContextMarkers,
  useEveningCheckIns,
  useGoals,
  useHabits,
  useHistory,
  useJournal,
  useMorningCheckIns,
  useProfile,
  useRoutines,
  useStreak,
  useTodaysMissions,
} from '../hooks';
import { Icon } from '../components/Icon';
import { greeting, formatLongDate, todayISO } from '../utils/format';
import { buildBestStateProfile, buildTodayFocus, findSimilarDay } from '../engine/personalization';
import { MIN_DAYS_FOR_PATTERNS } from '../config';

export function DashboardPage() {
  const navigate = useNavigate();
  const today = todayISO();
  const { profile } = useProfile();
  const { checkIns } = useCheckIns();
  const { set, update } = useTodaysMissions(today);
  const { history } = useHistory();
  const { streak } = useStreak();
  const { achievements } = useAchievements();
  const { habits, isCompleted } = useHabits();
  const { entries: morningEntries } = useMorningCheckIns();
  const { entries: eveningEntries } = useEveningCheckIns();
  const { markers, activeOn } = useContextMarkers();
  const { entries: journalEntries } = useJournal();
  const { routines, logs: routineLogs } = useRoutines();
  const { goals } = useGoals();

  const todayCheckIn = checkIns.find((checkIn) => checkIn.date === today) ?? null;
  const todaySummary = history.find((day) => day.date === today) ?? null;
  const morning = morningEntries.find((entry) => entry.date === today) ?? null;
  const evening = eveningEntries.find((entry) => entry.date === today) ?? null;
  const missions = set?.missions ?? todayCheckIn?.missions ?? [];
  const completedMissions = missions.filter((mission) => mission.completed).length;
  const score = todayCheckIn?.overall ?? todaySummary?.overall ?? null;
  const hasTodayData = score !== null;
  const focus = buildTodayFocus(todayCheckIn, goals);
  const bestState = useMemo(() => buildBestStateProfile(history), [history]);
  const similarDay = useMemo(() => findSimilarDay(history, todaySummary), [history, todaySummary]);
  const earnedAchievements = achievements.filter((achievement) => achievement.earned);
  const todaysHabits = habits.filter((habit) => habit.active && habit.daysOfWeek.includes(new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6));
  const completedHabits = todaysHabits.filter((habit) => isCompleted(habit.id, today)).length;
  const activeMarkers = activeOn(today);
  const todayJournal = journalEntries.filter((entry) => entry.date === today);
  const todayRoutineLogs = routineLogs.filter((log) => log.date === today && log.completed);

  const cta = getPrimaryAction({ morningDone: Boolean(morning), checkInDone: Boolean(todayCheckIn), eveningDone: Boolean(evening), missionsCount: missions.length });

  const journey = [
    morning ? { icon: 'Sunrise', title: 'Morning mapped', detail: `Energy ${morning.morningEnergy}/5` } : null,
    todayCheckIn ? { icon: 'Sparkles', title: 'Daily check-in', detail: `Balance ${todayCheckIn.overall}/100` } : null,
    completedHabits > 0 ? { icon: 'CheckCircle', title: `${completedHabits} habit${completedHabits === 1 ? '' : 's'} completed`, detail: 'Custom routine progress' } : null,
    todayRoutineLogs.length > 0 ? { icon: 'ListTodo', title: `${todayRoutineLogs.length} routine step${todayRoutineLogs.length === 1 ? '' : 's'} done`, detail: 'Your rhythm today' } : null,
    activeMarkers[0] ? { icon: 'Calendar', title: activeMarkers[0].label, detail: 'Context marker active' } : null,
    todayJournal[0] ? { icon: 'NotebookPen', title: 'Private reflection saved', detail: todayJournal[0].text.slice(0, 55) } : null,
    evening ? { icon: 'MoonStar', title: 'Evening reflected', detail: `Mood ${evening.mood}/5` } : null,
  ].filter(Boolean) as { icon: string; title: string; detail: string }[];

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-9">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-soft">{formatLongDate(today)}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">
            {greeting()}{profile?.preferredName ? `, ${profile.preferredName}` : ''}.
          </h1>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="chip border-olive-soft/40 bg-olive-tint/50 text-olive-deep"><Icon name="TrendingUp" size={13} /> {streak} day streak</span>
          <button onClick={() => navigate('/app/profile')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-silver bg-white text-ink-soft shadow-soft hover:border-olive-soft"><Icon name="CircleUserRound" size={18} /></button>
        </div>
      </header>

      <section className="relative mb-6 overflow-hidden rounded-[32px] bg-olive-shine px-6 py-7 text-white shadow-soft-lg md:px-9 md:py-9">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-olive-soft/25 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Today’s living balance</p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight md:text-4xl">
              {hasTodayData ? describeBalance(score) : 'Your day has not been mapped yet.'}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80">
              {hasTodayData
                ? todayCheckIn?.explanation ?? 'Today’s score is based only on what you logged.'
                : 'A short check-in will connect your mood, energy, stress, sleep, and daily rhythm.'}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate(cta.to)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-semibold text-olive-deep shadow-soft transition-all hover:-translate-y-0.5">
                <Icon name={cta.icon} size={18} /> {cta.label}
              </button>
              <button onClick={() => navigate('/app/quick-reset')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/35 bg-white/10 px-5 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20">
                <Icon name="Wind" size={18} /> Quick reset
              </button>
            </div>
          </div>

          <BalanceOrb score={score} completed={completedMissions} total={missions.length} />
        </div>
      </section>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="premium-card p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary"><Icon name={focus.icon} size={21} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Your focus today</p>
              <h2 className="mt-1 text-xl font-bold text-ink">{focus.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{focus.detail}</p>
              <button onClick={() => navigate(todayCheckIn ? '/app/missions' : '/check-in')} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-olive-primary hover:text-olive-deep">
                {todayCheckIn ? 'View today’s path' : 'Map today first'} <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </div>
        </section>

        <section className="premium-card p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Today so far</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TodayStat icon="MoonStar" label="Sleep" value={todaySummary?.sleepHours !== undefined ? `${todaySummary.sleepHours.toFixed(1)}h` : morning ? `${morning.sleepQuality}/5` : 'Not logged'} />
            <TodayStat icon="Zap" label="Energy" value={todayCheckIn ? `${Math.round(todayCheckIn.domainScores.energy)}` : morning ? `${morning.morningEnergy}/5` : 'Not logged'} />
            <TodayStat icon="Wind" label="Stress" value={todayCheckIn ? `${Math.round(todayCheckIn.domainScores.stress)}` : evening ? `${evening.stress}/5` : 'Not logged'} />
            <TodayStat icon="ListChecks" label="Plan" value={missions.length ? `${completedMissions}/${missions.length}` : 'Not set'} />
          </div>
        </section>
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Quick actions</p>
            <h2 className="mt-1 text-lg font-bold text-ink">Keep the next step close</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { to: '/app/habits', icon: 'Droplets', label: 'Log habits', detail: `${completedHabits}/${todaysHabits.length || 0} today` },
            { to: '/app/timeline', icon: 'Calendar', label: 'Add context', detail: markers.length ? `${activeMarkers.length} active` : 'Mark today' },
            { to: '/app/journal', icon: 'NotebookPen', label: 'Journal', detail: todayJournal.length ? 'Entry saved' : 'Write privately' },
            { to: '/app/routines', icon: 'ListTodo', label: 'Routines', detail: routines.length ? `${routines.filter((r) => r.active).length} active` : 'Build one' },
            { to: '/app/goals', icon: 'Target', label: 'Goals', detail: goals.length ? `${goals.filter((g) => g.active).length} active` : 'Choose focus' },
          ].map((item) => (
            <button key={item.to} onClick={() => navigate(item.to)} className="group rounded-3xl border border-silver bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-olive-soft/60 hover:shadow-soft-lg">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-tint text-olive-primary transition-transform group-hover:scale-105"><Icon name={item.icon} size={18} /></span>
              <p className="mt-3 text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-[11px] text-ink-soft">{item.detail}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="premium-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Today’s path</p>
              <h2 className="mt-1 text-lg font-bold text-ink">Small actions, connected</h2>
            </div>
            {missions.length > 0 && <span className="chip border-olive-soft/40 bg-olive-tint/50 text-olive-deep">{completedMissions}/{missions.length}</span>}
          </div>

          {missions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-6 text-center">
              <Icon name="Compass" size={24} className="mx-auto text-olive-primary" />
              <p className="mt-3 text-sm font-semibold text-ink">No path generated yet</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">Complete today’s check-in to receive three personalised actions.</p>
              <button onClick={() => navigate('/check-in')} className="btn-primary mt-4 !px-4 !py-2.5 text-sm">Begin check-in</button>
            </div>
          ) : (
            <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-gradient-to-b before:from-olive-soft before:to-silver-light">
              {missions.map((mission, index) => (
                <button key={mission.id} onClick={() => update(mission.id, { completed: !mission.completed })} className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${mission.completed ? 'border-olive-soft/50 bg-olive-tint/50' : 'border-silver bg-white hover:border-olive-soft/60'}`}>
                  <span className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold ${mission.completed ? 'border-olive-primary bg-olive-primary text-white' : 'border-silver bg-white text-olive-deep'}`}>
                    {mission.completed ? <Icon name="Check" size={17} /> : String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-semibold ${mission.completed ? 'text-ink line-through decoration-olive-soft' : 'text-ink'}`}>{mission.name}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-ink-soft">{mission.reason}</span>
                  </span>
                  <Icon name="ChevronRight" size={16} className="shrink-0 text-silver-dark" />
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-5">
          <section className="premium-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Aequimens noticed</p>
            {bestState ? (
              <>
                <h2 className="mt-2 text-base font-bold text-ink">Your better days share a rhythm</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">You tend to feel better when {bestState.conditions[0]}.</p>
                <button onClick={() => navigate('/app/insights')} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-olive-primary">View your best-state profile <Icon name="ArrowRight" size={14} /></button>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-base font-bold text-ink">Your first personal pattern is forming</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">Complete {Math.max(0, 14 - history.length)} more real check-in day{14 - history.length === 1 ? '' : 's'} to build a stronger best-state profile.</p>
              </>
            )}
          </section>

          {similarDay && (
            <section className="rounded-3xl border border-silver bg-gradient-to-br from-silver-metallic via-white to-olive-tint/40 p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-olive-primary shadow-soft"><Icon name="Gauge" size={18} /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Similar-day memory</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{similarDay.summary}</p>
                </div>
              </div>
            </section>
          )}

          <section className="premium-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Recent journey</p>
                <h2 className="mt-1 text-base font-bold text-ink">Today’s trail</h2>
              </div>
              <button onClick={() => navigate('/app/timeline')} className="text-xs font-semibold text-olive-primary">Timeline</button>
            </div>
            {journey.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-silver bg-silver-light/30 p-4 text-center text-xs leading-relaxed text-ink-soft">Your trail will appear as you check in, complete habits, add context, or write a reflection.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {journey.slice(0, 4).map((entry, index) => (
                  <div key={`${entry.title}-${index}`} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary"><Icon name={entry.icon} size={16} /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{entry.title}</p>
                      <p className="truncate text-xs text-ink-soft">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {earnedAchievements.length > 0 && (
            <section className="rounded-3xl bg-olive-forest p-5 text-white shadow-soft-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Latest achievement</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/12"><Icon name={earnedAchievements[earnedAchievements.length - 1].icon} size={20} /></span>
                <div><p className="text-sm font-semibold">{earnedAchievements[earnedAchievements.length - 1].name}</p><p className="mt-0.5 text-xs text-white/70">{earnedAchievements[earnedAchievements.length - 1].description}</p></div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={() => navigate('/bad-day')} className="text-sm font-medium text-ink-soft underline-offset-4 hover:text-olive-deep hover:underline">I’m having a difficult day</button>
        {history.length < MIN_DAYS_FOR_PATTERNS && <p className="text-xs text-ink-soft">Personal patterns unlock after {MIN_DAYS_FOR_PATTERNS} real check-in days.</p>}
      </div>
    </div>
  );
}

function BalanceOrb({ score, completed, total }: { score: number | null; completed: number; total: number }) {
  const value = score ?? 0;
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center md:h-64 md:w-64">
      <div className="absolute inset-0 animate-breathe rounded-full bg-white/10 blur-xl" />
      <div className="absolute inset-3 rounded-full border border-white/20 bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-[inset_0_0_40px_rgba(255,255,255,0.12)]" />
      <div className="absolute inset-8 rounded-full border border-white/25 bg-olive-forest/25 backdrop-blur-sm" />
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * value) / 100} className="transition-all duration-1000" />
      </svg>
      <div className="relative text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Balance</p>
        <p className="mt-1 text-6xl font-bold tracking-tight">{score ?? '—'}</p>
        <p className="mt-1 text-xs text-white/70">{score === null ? 'Complete a check-in' : `${completed}/${total || 0} actions complete`}</p>
      </div>
    </div>
  );
}

function TodayStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-silver bg-silver-light/35 p-3.5">
      <div className="flex items-center gap-2 text-ink-soft"><Icon name={icon} size={14} /><span className="text-[11px] font-medium">{label}</span></div>
      <p className="mt-2 text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function describeBalance(score: number | null): string {
  if (score === null) return 'Your day has not been mapped yet.';
  if (score >= 82) return 'You are moving through a strong, supported day.';
  if (score >= 68) return 'Your day feels mostly balanced, with room to recover.';
  if (score >= 52) return 'A few parts of today may need gentler attention.';
  return 'Today may feel heavier. Keep the next step very small.';
}

function getPrimaryAction({ morningDone, checkInDone, eveningDone, missionsCount }: { morningDone: boolean; checkInDone: boolean; eveningDone: boolean; missionsCount: number }) {
  const hour = new Date().getHours();
  if (hour < 12 && !morningDone) return { label: 'Start morning check-in', to: '/app/morning-check-in', icon: 'Sunrise' };
  if (!checkInDone) return { label: 'Map how you feel', to: '/check-in', icon: 'Sparkles' };
  if (hour >= 18 && !eveningDone) return { label: 'Reflect on today', to: '/app/evening-check-in', icon: 'MoonStar' };
  if (missionsCount > 0) return { label: 'Continue today’s plan', to: '/app/missions', icon: 'Compass' };
  return { label: 'View your progress', to: '/app/progress', icon: 'TrendingUp' };
}
