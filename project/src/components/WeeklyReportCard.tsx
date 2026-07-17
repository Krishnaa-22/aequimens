import { Icon } from './Icon';
import type { WeeklyReport } from '../types';
import { formatMonthDay } from '../utils/format';

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const improved = report.changePercent >= 0;

  return (
    <div className="premium-card overflow-hidden">
      <div className="relative border-b border-silver/60 bg-olive-shine px-6 py-5 text-white">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">Weekly reflection</p>
            <p className="mt-1 text-sm text-white/90">
              {formatMonthDay(report.weekStart)} – {formatMonthDay(report.weekEnd)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{report.currentScore}</p>
            <p className="text-xs text-white/80">wellness score</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div
          className={`mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            improved ? 'bg-olive-tint text-olive-deep' : 'bg-silver-light text-ink-soft'
          }`}
        >
          <Icon name={improved ? 'TrendingUp' : 'TrendingUp'} size={16} className={improved ? '' : 'rotate-180'} />
          {improved
            ? `Your wellness score improved by ${report.changePercent}% this week.`
            : `Your wellness score shifted by ${report.changePercent}% this week.`}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-olive-primary">Main improvements</p>
            <ul className="flex flex-col gap-2">
              {report.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink">
                  <Icon name="CheckCircle" size={16} className="mt-0.5 shrink-0 text-olive-primary" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-silver-dark">Remaining area</p>
            <div className="rounded-2xl border border-silver bg-silver-light/40 p-3.5">
              <p className="text-sm text-ink">{report.challenge}</p>
            </div>
            <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-olive-primary">Recommendation</p>
            <p className="text-sm leading-relaxed text-ink-soft">{report.recommendation}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-olive-tint/50 p-3.5">
          <p className="text-xs leading-relaxed text-olive-deep">
            Based on your responses this week. This is general wellness insight, not a medical assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
