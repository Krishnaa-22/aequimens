import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory, useAchievements } from '../hooks';
import { AchievementBadge } from '../components/AchievementBadge';
import { WeeklyReportCard } from '../components/WeeklyReportCard';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { detectTriggers, buildWeeklyReport } from '../engine/insights';
import { buildBestStateProfile, findSimilarDay } from '../engine/personalization';
import { todayISO } from '../utils/format';
import { ShareableCard } from './ShareableCard';
import {
  MIN_DAYS_FOR_PATTERNS,
  MIN_DAYS_FOR_SHARE_CARD,
  MIN_DAYS_FOR_WEEKLY_REPORT,
} from '../config';

export function InsightsPage() {
  const navigate = useNavigate();
  const { history } = useHistory();
  const { achievements } = useAchievements();
  const [shareOpen, setShareOpen] = useState(false);

  const triggers = useMemo(() => detectTriggers(history), [history]);
  const report = useMemo(() => buildWeeklyReport(history), [history]);
  const bestState = useMemo(() => buildBestStateProfile(history), [history]);
  const todaySummary = history.find((day) => day.date === todayISO()) ?? null;
  const similarDay = useMemo(() => findSimilarDay(history, todaySummary), [history, todaySummary]);

  const negative = triggers.filter((trigger) => trigger.type === 'negative');
  const positive = triggers.filter((trigger) => trigger.type === 'positive');
  const hasAnyData = history.length > 0;
  const canShowReport = history.length >= MIN_DAYS_FOR_WEEKLY_REPORT;
  const canShowPatterns = history.length >= MIN_DAYS_FOR_PATTERNS;
  const canShare = history.length >= MIN_DAYS_FOR_SHARE_CARD;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Insights</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Patterns in your week</h1>
        </div>
        {canShare && (
          <button onClick={() => setShareOpen(true)} className="btn-secondary self-start">
            <Icon name="Share2" size={16} /> Share
          </button>
        )}
      </header>

      {!hasAnyData ? (
        <EmptyState
          icon="Sparkles"
          title="No insights yet"
          description={`Complete your first check-in to get started. A weekly reflection unlocks after ${MIN_DAYS_FOR_WEEKLY_REPORT} check-in days, and personal patterns after ${MIN_DAYS_FOR_PATTERNS}.`}
          action={
            <button onClick={() => navigate('/check-in')} className="btn-primary">
              Begin check-in
            </button>
          }
        />
      ) : (
        <>
          <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">Explain my week</h2>
            {canShowReport && report ? (
              <WeeklyReportCard report={report} />
            ) : (
              <DataLockedState
                icon="CalendarDays"
                title="Your weekly reflection is still forming"
                current={history.length}
                required={MIN_DAYS_FOR_WEEKLY_REPORT}
              />
            )}
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">Personal patterns</h2>
            {!canShowPatterns ? (
              <DataLockedState
                icon="GitBranch"
                title="More check-in days are needed for personal patterns"
                current={history.length}
                required={MIN_DAYS_FOR_PATTERNS}
              />
            ) : triggers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-5 text-center">
                <Icon name="Sparkles" size={20} className="mx-auto text-olive-primary" />
                <p className="mt-2 text-sm font-semibold text-ink">No repeated patterns yet</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Your real entries do not yet show a repeated lifestyle pattern. Keep checking in and
                  Aequimens will continue looking for useful, non-medical observations.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs leading-relaxed text-ink-soft">
                  These observations come only from your stored check-ins. They are not scientific
                  correlations or medical conclusions.
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  <PatternColumn
                    title="Patterns worth monitoring"
                    icon="AlertTriangle"
                    patterns={negative}
                    positive={false}
                  />
                  <PatternColumn
                    title="Supportive patterns"
                    icon="CheckCircle"
                    patterns={positive}
                    positive
                  />
                </div>
              </>
            )}
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">Your best-state profile</h2>
            {bestState ? (
              <div className="rounded-3xl border border-silver bg-gradient-to-br from-olive-tint/70 via-white to-silver-light/40 p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-olive-primary shadow-soft">
                    <Icon name="Gauge" size={19} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Based on your strongest days</p>
                    <h3 className="mt-1 text-lg font-bold text-ink">You tend to feel your best when…</h3>
                    <ul className="mt-3 space-y-2">
                      {bestState.conditions.map((condition) => (
                        <li key={condition} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                          <Icon name="CheckCircle" size={15} className="mt-0.5 shrink-0 text-olive-primary" />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] text-ink-soft">Built from {bestState.sampleSize} of your strongest logged days. This is a personal observation, not medical evidence.</p>
                  </div>
                </div>
              </div>
            ) : (
              <DataLockedState icon="Gauge" title="Your best-state profile is still forming" current={history.length} required={14} />
            )}
          </section>

          {similarDay && (
            <section className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-ink">Similar-day memory</h2>
              <div className="rounded-2xl border border-silver bg-white p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary"><Icon name="Calendar" size={18} /></span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{similarDay.similarity}% similar to a previous day</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{similarDay.summary}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="mb-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">Achievements</h2>
            {achievements.length === 0 ? (
              <EmptyState
                icon="Trophy"
                title="No achievements yet"
                description="Keep checking in and completing real missions to begin earning achievements."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {achievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <div className="rounded-2xl border border-silver bg-silver-light/40 p-4">
        <p className="text-xs leading-relaxed text-ink-soft">
          Aequimens insights are general wellness observations, not medical diagnoses. If patterns feel
          concerning, consider seeking qualified support.
        </p>
      </div>

      <ShareableCard open={shareOpen} onClose={() => setShareOpen(false)} history={history} />
    </div>
  );
}

function DataLockedState({
  icon,
  title,
  current,
  required,
}: {
  icon: string;
  title: string;
  current: number;
  required: number;
}) {
  const remaining = Math.max(0, required - current);
  return (
    <div className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-5 text-center">
      <Icon name={icon} size={20} className="mx-auto text-olive-primary" />
      <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        Complete {remaining} more check-in day{remaining === 1 ? '' : 's'} to unlock this feature.
      </p>
    </div>
  );
}

function PatternColumn({
  title,
  icon,
  patterns,
  positive,
}: {
  title: string;
  icon: string;
  patterns: ReturnType<typeof detectTriggers>;
  positive: boolean;
}) {
  return (
    <div>
      <p
        className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
          positive ? 'text-olive-primary' : 'text-silver-dark'
        }`}
      >
        {title}
      </p>
      {patterns.length === 0 ? (
        <p className="rounded-2xl border border-silver bg-white p-4 text-xs leading-relaxed text-ink-soft">
          No repeated {positive ? 'supportive' : 'negative'} pattern was found in your current data.
        </p>
      ) : (
        <div className="space-y-2.5">
          {patterns.map((trigger) => (
            <div
              key={trigger.id}
              className="flex items-center justify-between rounded-2xl border border-silver bg-white p-3.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    positive ? 'bg-olive-tint text-olive-primary' : 'bg-silver-light text-ink-soft'
                  }`}
                >
                  <Icon name={icon} size={15} />
                </span>
                <p className="text-sm text-ink">{trigger.label}</p>
              </div>
              <span
                className={`text-xs font-semibold ${positive ? 'text-olive-primary' : 'text-ink-soft'}`}
              >
                {trigger.occurrences}x
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
