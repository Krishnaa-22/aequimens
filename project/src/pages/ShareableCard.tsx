import { useMemo } from 'react';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { Modal } from '../components/Modal';
import { LogoMark } from '../components/LogoMark';
import { Icon } from '../components/Icon';
import { useToast } from '../hooks/useToast';
import type { DaySummary } from '../types';
import { formatMonthDay, todayISO } from '../utils/format';
import { MIN_DAYS_FOR_SHARE_CARD } from '../config';

interface ShareableCardProps {
  open: boolean;
  onClose: () => void;
  history: DaySummary[];
}

interface CardMetric {
  icon: string;
  label: string;
  value: string;
}

export function ShareableCard({ open, onClose, history }: ShareableCardProps) {
  const { show } = useToast();
  const ready = history.length >= MIN_DAYS_FOR_SHARE_CARD;

  const stats = useMemo(() => {
    if (!ready) return null;

    const last7 = [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
    const current = last7[last7.length - 1];
    const previous = last7[0];
    const change =
      previous.overall === 0
        ? 0
        : Math.round(((current.overall - previous.overall) / previous.overall) * 100);

    let missionStreak = 0;
    let laterDate: string | null = null;
    for (let index = last7.length - 1; index >= 0; index -= 1) {
      const day = last7[index];
      if (day.missionsTotal === 0 || day.missionsCompleted === 0) break;
      if (
        laterDate !== null &&
        differenceInCalendarDays(parseISO(laterDate), parseISO(day.date)) !== 1
      ) {
        break;
      }
      missionStreak += 1;
      laterDate = day.date;
    }

    const metrics: CardMetric[] = [
      { icon: 'TrendingUp', label: 'Wellness score', value: `${current.overall}` },
      { icon: 'CheckCircle', label: 'Mission streak', value: `${missionStreak} day${missionStreak === 1 ? '' : 's'}` },
    ];

    const activityEntries = last7.filter((day) => day.activeMinutes !== undefined);
    if (activityEntries.length >= 2) {
      const activeDays = activityEntries.filter((day) => (day.activeMinutes ?? 0) >= 15).length;
      metrics.push({ icon: 'Dumbbell', label: 'Active days', value: `${activeDays}/${activityEntries.length}` });
    }

    const sleepEntries = last7.filter((day) => day.sleepHours !== undefined);
    if (sleepEntries.length >= 2) {
      const sleepDays = sleepEntries.filter((day) => (day.sleepHours ?? 0) >= 7).length;
      metrics.push({ icon: 'MoonStar', label: 'Sleep goal', value: `${sleepDays}/${sleepEntries.length}` });
    }

    const screenEntries = last7.filter(
      (day): day is DaySummary & { screenMinutes: number } =>
        typeof day.screenMinutes === 'number',
    );
    let screenReduction: number | null = null;
    if (screenEntries.length >= 4) {
      const splitAt = Math.floor(screenEntries.length / 2);
      const first = screenEntries.slice(0, splitAt);
      const second = screenEntries.slice(-splitAt);
      const average = (days: (DaySummary & { screenMinutes: number })[]) =>
        days.reduce((sum, day) => sum + day.screenMinutes, 0) / days.length;
      const firstAverage = average(first);
      const secondAverage = average(second);
      if (firstAverage > 0 && firstAverage - secondAverage > 0) {
        screenReduction = Math.round(((firstAverage - secondAverage) / firstAverage) * 100);
      }
    }

    return {
      score: current.overall,
      change,
      latestDate: current.date,
      metrics,
      screenReduction,
    };
  }, [history, ready]);

  const summary = stats
    ? `My Aequimens reflection: wellness score ${stats.score}, ${stats.change >= 0 ? '+' : ''}${stats.change}% across this period. ${stats.metrics
        .slice(1)
        .map((metric) => `${metric.label}: ${metric.value}`)
        .join(', ')}. Understand your patterns. Restore your balance.`
    : '';

  const download = () => {
    show('Card ready — use Copy Summary or Share to post it.', 'info');
  };

  const copySummary = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(summary);
      show('Summary copied to clipboard', 'success');
    } catch {
      show('Copy unavailable — your browser blocked clipboard', 'info');
    }
  };

  const share = async () => {
    if (!stats) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Aequimens reflection', text: summary });
      } catch {
        /* user cancelled */
      }
    } else {
      await copySummary();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Shareable wellness card" size="md">
      {!stats ? (
        <div className="rounded-2xl border border-dashed border-silver bg-silver-light/30 p-6 text-center">
          <Icon name="Share2" size={22} className="mx-auto text-olive-primary" />
          <p className="mt-2 text-sm font-semibold text-ink">Your share card is still forming</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            Complete {Math.max(0, MIN_DAYS_FOR_SHARE_CARD - history.length)} more check-in day
            {MIN_DAYS_FOR_SHARE_CARD - history.length === 1 ? '' : 's'} to create a card from real data.
          </p>
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl bg-olive-shine p-6 text-white shadow-soft-lg">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <LogoMark size={32} withShine={false} />
                  <span className="text-xs font-bold tracking-widest">AEQUIMENS</span>
                </div>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium">
                  {formatMonthDay(stats.latestDate ?? todayISO())}
                </span>
              </div>

              <p className="mt-6 text-balance text-lg font-semibold leading-snug">
                {stats.change > 0
                  ? `My wellness score improved ${stats.change}% across this reflection period`
                  : stats.change < 0
                    ? 'A week of honest reflection and small steps'
                    : 'A steady week of reflection'}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {stats.metrics.map((metric) => (
                  <Stat key={metric.label} {...metric} />
                ))}
              </div>

              {stats.screenReduction !== null && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium">
                  <Icon name="MoonStar" size={14} />
                  Screen time reduced by {stats.screenReduction}%
                </div>
              )}

              <p className="mt-5 text-[10px] leading-relaxed text-white/70">
                General wellness insight. Aequimens does not diagnose or treat medical conditions.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <button onClick={download} className="btn-secondary flex-col !px-2 !py-3 text-xs">
              <Icon name="Download" size={18} /> Download
            </button>
            <button onClick={share} className="btn-primary flex-col !px-2 !py-3 text-xs">
              <Icon name="Share2" size={18} /> Share
            </button>
            <button onClick={copySummary} className="btn-secondary flex-col !px-2 !py-3 text-xs">
              <Icon name="Copy" size={18} /> Copy
            </button>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">
            Suits Instagram Stories, WhatsApp Status, LinkedIn, and X. No mental-health labels,
            journal content, or private answers are included.
          </p>
        </>
      )}
    </Modal>
  );
}

function Stat({ icon, label, value }: CardMetric) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-white/80">
        <Icon name={icon} size={12} /> {label}
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
