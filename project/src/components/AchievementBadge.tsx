import { Icon } from './Icon';
import type { Achievement } from '../types';

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  if (achievement.earned) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-silver bg-white p-4 shadow-soft transition-transform hover:-translate-y-0.5">
        {/* brushed silver + olive enamel */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-silver-light/40" />
        <div className="relative flex items-start gap-3.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-olive-shine text-white shadow-soft">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent" />
            <Icon name={achievement.icon} size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-ink">{achievement.name}</p>
              <span className="chip border-olive-soft/40 bg-olive-tint text-olive-deep">
                <Icon name="Trophy" size={12} /> Earned
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{achievement.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-silver bg-white/50 p-4">
      <div className="flex items-start gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-silver-light text-silver-dark">
          <Icon name={achievement.icon} size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-soft">{achievement.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{achievement.description}</p>
          <div className="mt-2.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-silver-light">
              <div
                className="h-full rounded-full bg-olive-soft transition-all duration-500"
                style={{ width: `${achievement.progress ?? 0}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] font-medium text-ink-soft">{achievement.progress ?? 0}% progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
