import { useMemo, useState } from 'react';
import { useHistory, useAchievements } from '../hooks';
import { AchievementBadge } from '../components/AchievementBadge';
import { WeeklyReportCard } from '../components/WeeklyReportCard';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { detectTriggers, buildWeeklyReport } from '../engine/insights';
import { ShareableCard } from './ShareableCard';

export function InsightsPage() {
  const { history } = useHistory();
  const { achievements } = useAchievements();
  const [shareOpen, setShareOpen] = useState(false);

  const triggers = useMemo(() => detectTriggers(history), [history]);
  const report = useMemo(() => buildWeeklyReport(history), [history]);

  const negative = triggers.filter((t) => t.type === 'negative');
  const positive = triggers.filter((t) => t.type === 'positive');
  const isSample = triggers.some((t) => t.sample);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Insights</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Patterns in your week</h1>
        </div>
        <button onClick={() => setShareOpen(true)} className="btn-secondary self-start">
          <Icon name="Share2" size={16} /> Share
        </button>
      </header>

      {report && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Explain my week</h2>
          <WeeklyReportCard report={report} />
        </section>
      )}

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Personal triggers</h2>
          {isSample && (
            <span className="chip border-silver bg-silver-light/60 text-ink-soft">
              <Icon name="Info" size={12} /> Early sample insights
            </span>
          )}
        </div>
        <p className="mb-4 text-xs leading-relaxed text-ink-soft">
          These patterns are derived from your recent check-ins. Until enough data is gathered, they are
          labelled as early sample insights — not scientific correlations.
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-silver-dark">Common negative patterns</p>
            <div className="space-y-2.5">
              {negative.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-2xl border border-silver bg-white p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-silver-light text-ink-soft">
                      <Icon name="AlertTriangle" size={15} />
                    </span>
                    <p className="text-sm text-ink">{t.label}</p>
                  </div>
                  <span className="text-xs font-semibold text-ink-soft">{t.occurrences}x</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-olive-primary">Positive patterns</p>
            <div className="space-y-2.5">
              {positive.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-2xl border border-silver bg-white p-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive-tint text-olive-primary">
                      <Icon name="CheckCircle" size={15} />
                    </span>
                    <p className="text-sm text-ink">{t.label}</p>
                  </div>
                  <span className="text-xs font-semibold text-olive-primary">{t.occurrences}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">Achievements</h2>
        {achievements.length === 0 ? (
          <EmptyState icon="Trophy" title="No achievements yet" description="Keep checking in daily to earn mature, meaningful badges." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        )}
      </section>

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
