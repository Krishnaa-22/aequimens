import { useMemo, useState } from 'react';
import { useHistory } from '../hooks';
import { TrendChart } from '../components/TrendChart';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import type { DayStatus } from '../types';
import { formatShortDate } from '../utils/format';

type Range = 7 | 30 | 90;

const STATUS_STYLES: Record<DayStatus, { dot: string; label: string }> = {
  strong: { dot: '#667A3E', label: 'Strong day' },
  good: { dot: '#9BAE70', label: 'Good day' },
  balanced: { dot: '#888E8B', label: 'Balanced day' },
  difficult: { dot: '#3E4A27', label: 'Difficult day' },
};

export function ProgressPage() {
  const { history } = useHistory();
  const [range, setRange] = useState<Range>(7);

  const slice = useMemo(() => history.slice(-range), [history, range]);

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-6">
        <EmptyState icon="TrendingUp" title="No progress data yet" description="Complete check-ins to build your progress charts and calendar." />
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
          {([7, 30, 90] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                range === r ? 'bg-olive-tint text-olive-deep shadow-[inset_0_0_0_1px_rgba(155,174,112,0.4)]' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {r === 7 ? '7 days' : r === 30 ? '30 days' : '3 months'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Mood trend"><TrendChart data={slice} dataKey="mood" label="Mood" type="area" domain={[0, 100]} /></Card>
        <Card title="Energy trend"><TrendChart data={slice} dataKey="energy" label="Energy" type="area" domain={[0, 100]} /></Card>
        <Card title="Stress trend"><TrendChart data={slice} dataKey="stress" label="Stress" color="#888E8B" type="line" domain={[0, 100]} invert /></Card>
        <Card title="Sleep duration"><TrendChart data={slice} dataKey="sleepHours" label="Sleep" type="bar" color="#9BAE70" domain={[0, 10]} unit="h" /></Card>
        <Card title="Mission completion"><TrendChart data={slice} dataKey="missionsCompleted" label="Done" type="bar" color="#667A3E" domain={[0, 3]} /></Card>
        <Card title="Screen-time trend"><TrendChart data={slice} dataKey="screenMinutes" label="Screen" color="#888E8B" type="line" domain={[0, 'auto' as never]} unit="m" /></Card>
        <Card title="Hydration consistency"><TrendChart data={slice} dataKey="waterGlasses" label="Water" type="bar" color="#9BAE70" domain={[0, 10]} /></Card>
        <Card title="Activity consistency"><TrendChart data={slice} dataKey="activeMinutes" label="Active" type="bar" color="#667A3E" domain={[0, 'auto' as never]} unit="m" /></Card>
      </div>

      {/* Calendar */}
      <section className="premium-card mt-6 p-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Wellness calendar</h2>
        <p className="mb-4 text-xs text-ink-soft">A gentle view of how each day felt.</p>
        <div className="grid grid-cols-7 gap-1.5">
          {slice.map((d) => (
            <div key={d.date} className="group relative aspect-square">
              <div
                className="flex h-full w-full items-center justify-center rounded-xl text-[10px] font-medium text-white"
                style={{ backgroundColor: STATUS_STYLES[d.status].dot, opacity: d.status === 'balanced' ? 0.55 : 0.85 }}
                title={`${formatShortDate(d.date)} — ${STATUS_STYLES[d.status].label} (score ${d.overall})`}
              >
                {Number(d.date.slice(8))}
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, range - slice.length) }).map((_, i) => (
            <div key={`gap-${i}`} className="aspect-square rounded-xl bg-silver-light/40" />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.keys(STATUS_STYLES) as DayStatus[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_STYLES[s].dot, opacity: s === 'balanced' ? 0.55 : 0.85 }} />
              {STATUS_STYLES[s].label}
            </span>
          ))}
        </div>
      </section>
    </div>
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
