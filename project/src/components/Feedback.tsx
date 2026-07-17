import { Icon } from './Icon';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  label?: string;
  showCount?: boolean;
  current?: number;
  total?: number;
  className?: string;
}

export function ProgressBar({ value, label, showCount, current, total, className }: ProgressBarProps) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={className}>
      {(label || showCount) && (
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-soft">
          <span>{label}</span>
          {showCount && typeof current === 'number' && typeof total === 'number' && (
            <span aria-live="polite">
              {current} of {total}
            </span>
          )}
        </div>
      )}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-silver-light"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #9BAE70, #667A3E)',
          }}
        />
      </div>
    </div>
  );
}

export function PrivacyBadge({ text = 'Your data stays on this device' }: { text?: string }) {
  return (
    <span className="chip border-olive-soft/40 bg-olive-tint/60 text-olive-deep">
      <Icon name="Lock" size={13} />
      {text}
    </span>
  );
}

export function EmptyState({
  icon = 'Sparkles',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-silver bg-white/60 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
        <Icon name={icon} size={26} />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-silver border-t-olive-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
