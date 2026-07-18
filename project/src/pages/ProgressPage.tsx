import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '../hooks';
import { TrendChart } from '../components/TrendChart';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import type { DayStatus, DaySummary } from '../types';
import { formatShortDate } from '../utils/format';
import { MIN_DAYS_FOR_TRENDS } from '../config';

type Range = 7 | 30 | 90;

const STATUS_STYLES: Record<DayStatus, { dot: string; label: string }> = {
  strong: { dot: '#667A3E', label: 'Strong day' },
  good: { dot: '#9BAE70', label: 'Good day' },
  balanced: { dot: '#888E8B', label: 'Balanced day' },
  difficult: { dot: '#3E4A27', label: 'Difficult day' },
};

const MIN_POINTS_PER_OPTIONAL_METRIC = 2;

export function ProgressPage() {
  const navigate = useNavigate();
  const { history } = useHistory();
  const [range, setRange] = useState<Range>(7);

  const slice = useMemo(() => history.slice(-range), [history, range]);

  if (history.length < MIN_DAYS_FOR_TRENDS) {
    const remaining = MIN_DAYS_FOR_TRENDS - history.length;
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-6">
        <EmptyState
          icon="TrendingUp"
          title="No progress data yet"
          description={
            history.length === 0
              ? `Complete your first check-in to start building progress charts and your wellness calendar. Charts unlock after ${MIN_DAYS_FOR_TRENDS} check-in days.`
              : `Complete ${remaining} more check-in day${remaining === 1 ? '' : 's'} to unlock your progress charts and calendar.`
          }
          action={
            <button onClick={() => navigate('/check-in')} className="btn-primary">
              {history.length === 0 ? 'Begin check-in' : 'Check in today'}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Progress</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Your trends over time</h1>
        </div>
        <div className="flex rounded-2xl border border-silver bg-white p-1">
          {([7, 30, 90] as Range[]).map((option) => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                range === option
                  ? 'bg-olive-tint text-olive-deep shadow-[inset_0_0_0_1px_rgba(155,174,112,0.4)]'
                  : 'text-ink-soft hover:text-ink'
              }`}
            >
              {option === 7 ? '7 days' : option === 30 ? '30 days' : '3 months'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Mood trend">
          <TrendChart data={slice} dataKey="mood" label="Mood" type="area" domain={[0, 100]} />
        </Card>
        <Card title="Energy trend">
          <TrendChart data={slice} dataKey="energy" label="Energy" type="area" domain={[0, 100]} />
        </Card>
        <Card title="Stress trend">
          <TrendChart data={slice} dataKey="stress" label="Stress" color="#888E8B" type="line" domain={[0, 100]} invert />
        </Card>
        <OptionalMetricCard title="Sleep duration" data={slice} dataKey="sleepHours" emptyText="Sleep duration appears only on days when that follow-up was relevant.">
          <TrendChart data={slice} dataKey="sleepHours" label="Sleep" type="bar" color="#9BAE70" domain={[0, 10]} unit="h" />
        </OptionalMetricCard>
        <Card title="Mission completion">
          <TrendChart data={slice} dataKey="missionsCompleted" label="Done" type="bar" color="#667A3E" domain={[0, 3]} />
        </Card>
        <OptionalMetricCard title="Screen-time trend" data={slice} dataKey="screenMinutes" emptyText="Keep checking in when sleep follow-ups appear to build this trend.">
          <TrendChart data={slice} dataKey="screenMinutes" label="Screen" color="#888E8B" type="line" unit="m" />
        </OptionalMetricCard>
        <OptionalMetricCard title="Hydration consistency" data={slice} dataKey="waterGlasses" emptyText="Hydration is recorded only when the related follow-up is asked.">
          <TrendChart data={slice} dataKey="waterGlasses" label="Water" type="bar" color="#9BAE70" domain={[0, 10]} />
        </OptionalMetricCard>
        <OptionalMetricCard title="Activity consistency" data={slice} dataKey="activeMinutes" emptyText="Activity is recorded only when the related follow-up is asked.">
          <TrendChart data={slice} dataKey="activeMinutes" label="Active" type="bar" color="#667A3E" unit="m" />
        </OptionalMetricCard>
      </div>

      <section className="premium-card mt-6 p-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Wellness calendar</h2>
        <p className="mb-4 text-xs text-ink-soft">A gentle view of how each recorded day felt.</p>
        <div className="grid grid-cols-7 gap-1.5">
          {slice.map((day) => (
            <div key={day.date} className="group relative aspect-square">
              <div
                className="flex h-full w-full items-center justify-center rounded-xl text-[10px] font-medium text-white"
                style={{
                  backgroundColor: STATUS_STYLES[day.status].dot,
                  opacity: day.status === 'balanced' ? 0.55 : 0.85,
                }}
                title={`${formatShortDate(day.date)} — ${STATUS_STYLES[day.status].label} (score ${day.overall})`}
              >
                {Number(day.date.slice(8))}
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, range - slice.length) }).map((_, index) => (
            <div key={`gap-${index}`} className="aspect-square rounded-xl bg-silver-light/40" />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.keys(STATUS_STYLES) as DayStatus[]).map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: STATUS_STYLES[status].dot,
                  opacity: status === 'balanced' ? 0.55 : 0.85,
                }}
              />
              {STATUS_STYLES[status].label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function hasEnoughMetricData(data: DaySummary[], dataKey: keyof DaySummary): boolean {
  return data.filter((day) => typeof day[dataKey] === 'number').length >= MIN_POINTS_PER_OPTIONAL_METRIC;
}

function OptionalMetricCard({
  title,
  data,
  dataKey,
  emptyText,
  children,
}: {
  title: string;
  data: DaySummary[];
  dataKey: keyof DaySummary;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card title={title}>
      {hasEnoughMetricData(data, dataKey) ? (
        children
      ) : (
        <p className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-4 text-center text-xs leading-relaxed text-ink-soft">
          Not enough real data yet. {emptyText}
        </p>
      )}
    </Card>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="premium-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon name="TrendingUp" size={16} className="text-olive-primary" />
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
