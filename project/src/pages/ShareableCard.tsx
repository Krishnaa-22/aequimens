import { useMemo } from 'react';
import { Modal } from '../components/Modal';
import { LogoMark } from '../components/LogoMark';
import { Icon } from '../components/Icon';
import { useToast } from '../components/Toast';
import type { DaySummary } from '../types';
import { formatMonthDay } from '../utils/format';

interface ShareableCardProps {
  open: boolean;
  onClose: () => void;
  history: DaySummary[];
}

export function ShareableCard({ open, onClose, history }: ShareableCardProps) {
  const { show } = useToast();

  const stats = useMemo(() => {
    const last7 = history.slice(-7);
    if (last7.length === 0) {
      return { score: 0, change: 0, activeDays: 0, sleepDays: 0, streak: 0, screenReduction: 0 };
    }
    const current = last7[last7.length - 1].overall;
    const previous = last7[0].overall;
    const change = previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
    const activeDays = last7.filter((d) => (d.activeMinutes ?? 0) >= 15).length;
    const sleepDays = last7.filter((d) => (d.sleepHours ?? 0) >= 7).length;
    const streak = last7.filter((d) => d.missionsCompleted > 0).length;
    const avgScreenFirst = last7.slice(0, 3).reduce((s, d) => s + (d.screenMinutes ?? 0), 0) / 3;
    const avgScreenLast = last7.slice(-3).reduce((s, d) => s + (d.screenMinutes ?? 0), 0) / 3;
    const screenReduction = avgScreenFirst === 0 ? 0 : Math.round(((avgScreenFirst - avgScreenLast) / avgScreenFirst) * 100);
    return { score: current, change, activeDays, sleepDays, streak, screenReduction };
  }, [history]);

  const summary = `My week with Aequimens: wellness score ${stats.score}${stats.change >= 0 ? '+' : ''}${stats.change}%, ${stats.activeDays} active days, ${stats.sleepDays}/7 sleep goal, ${stats.streak}-day consistency. Understand your patterns. Restore your balance.`;

  const download = () => {
    // No canvas generation — we offer copy/summary and share APIs instead.
    show('Card ready — use Copy Summary or Share to post it.', 'info');
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      show('Summary copied to clipboard', 'success');
    } catch {
      show('Copy unavailable — your browser blocked clipboard', 'info');
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Aequimens week', text: summary });
      } catch {
        /* user cancelled */
      }
    } else {
      copySummary();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Shareable wellness card" size="md">
      {/* Card preview — Instagram Stories / WhatsApp Status / LinkedIn / X friendly */}
      <div className="overflow-hidden rounded-2xl bg-olive-shine p-6 text-white shadow-soft-lg">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LogoMark size={32} withShine={false} />
              <span className="text-xs font-bold tracking-widest">AEQUIMENS</span>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium">
              {formatMonthDay(history[history.length - 1]?.date ?? new Date().toISOString())}
            </span>
          </div>

          <p className="mt-6 text-balance text-lg font-semibold leading-snug">
            {stats.change >= 0 ? `My wellness improved ${stats.change}% this week` : `A week of reflection`}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat icon="TrendingUp" label="Wellness score" value={`${stats.score}`} />
            <Stat icon="CheckCircle" label="Consistency" value={`${stats.streak} days`} />
            <Stat icon="Dumbbell" label="Active days" value={`${stats.activeDays}`} />
            <Stat icon="MoonStar" label="Sleep goal" value={`${stats.sleepDays}/7`} />
          </div>

          {stats.screenReduction > 0 && (
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
        Suits Instagram Stories, WhatsApp Status, LinkedIn, and X. No mental-health labels, journal
        content, or private answers are ever included.
      </p>
    </Modal>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-white/80">
        <Icon name={icon} size={12} /> {label}
      </div>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
