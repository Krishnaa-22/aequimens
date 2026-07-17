import { Icon } from './Icon';
import type { Contributor } from '../types';
import { impactLabel } from '../utils/format';

const IMPACT_STYLES: Record<Contributor['impact'], { ring: string; chip: string; label: string }> = {
  high: {
    ring: 'border-olive-soft/50 bg-olive-tint/50',
    chip: 'bg-olive-deep text-white',
    label: 'text-olive-deep',
  },
  moderate: {
    ring: 'border-silver bg-white',
    chip: 'bg-olive-primary text-white',
    label: 'text-olive-primary',
  },
  small: {
    ring: 'border-silver/60 bg-white/70',
    chip: 'bg-silver-dark text-white',
    label: 'text-ink-soft',
  },
};

export function ContributorCard({ contributor }: { contributor: Contributor }) {
  const styles = IMPACT_STYLES[contributor.impact];
  const positive = contributor.direction === 'positive';

  return (
    <div className={`rounded-2xl border ${styles.ring} p-4 transition-all hover:shadow-soft`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              positive ? 'bg-olive-tint text-olive-primary' : 'bg-silver-light text-ink-soft'
            }`}
          >
            <Icon name={positive ? 'CheckCircle' : 'AlertTriangle'} size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{contributor.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{contributor.detail}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${styles.chip}`}>
          {positive ? 'Supporting' : impactLabel(contributor.impact)}
        </span>
      </div>
    </div>
  );
}
