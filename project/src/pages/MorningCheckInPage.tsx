import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useMorningCheckIns, useToast } from '../hooks';
import { todayISO } from '../utils/format';

const SLEEP_OPTIONS = [
  { value: 1, label: 'Poor', icon: 'CloudRain' },
  { value: 2, label: 'Rough', icon: 'Cloud' },
  { value: 3, label: 'Okay', icon: 'CircleDashed' },
  { value: 4, label: 'Good', icon: 'Sun' },
  { value: 5, label: 'Great', icon: 'Sparkles' },
];

const ENERGY_OPTIONS = [
  { value: 1, label: 'Very low', icon: 'BatteryLow' },
  { value: 2, label: 'Low', icon: 'BatteryMedium' },
  { value: 3, label: 'Okay', icon: 'Battery' },
  { value: 4, label: 'Good', icon: 'BatteryFull' },
  { value: 5, label: 'High', icon: 'Zap' },
];

function ScaleRow({
  options,
  value,
  onSelect,
}: {
  options: { value: number; label: string; icon: string }[];
  value: number | null;
  onSelect: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className={`flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center transition-all duration-200 ${
            value === opt.value
              ? 'border-olive-primary bg-olive-tint text-olive-deep shadow-glow'
              : 'border-silver bg-white text-ink-soft hover:border-olive-soft/60'
          }`}
        >
          <Icon name={opt.icon} size={20} />
          <span className="text-[11px] font-medium leading-tight">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

export function MorningCheckInPage() {
  const navigate = useNavigate();
  const { save, todayEntry } = useMorningCheckIns();
  const { show } = useToast();
  const today = todayISO();
  const existing = todayEntry(today);

  const [sleepQuality, setSleepQuality] = useState<number | null>(existing?.sleepQuality ?? null);
  const [morningEnergy, setMorningEnergy] = useState<number | null>(existing?.morningEnergy ?? null);
  const [focus, setFocus] = useState(existing?.focus ?? '');

  const canSubmit = sleepQuality !== null && morningEnergy !== null && focus.trim().length > 0;

  const submit = () => {
    if (!canSubmit || sleepQuality === null || morningEnergy === null) return;
    save({ date: today, sleepQuality, morningEnergy, focus: focus.trim(), completedAt: new Date().toISOString() });
    show(existing ? 'Morning check-in updated' : 'Morning check-in saved', 'success');
    navigate('/app');
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Morning check-in</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">A quick start to the day</h1>
        <p className="mt-1.5 text-sm text-ink-soft">Three short taps — nothing more.</p>
      </header>

      <section className="premium-card mb-4 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">How did you sleep?</h2>
        <ScaleRow options={SLEEP_OPTIONS} value={sleepQuality} onSelect={setSleepQuality} />
      </section>

      <section className="premium-card mb-4 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">How's your energy this morning?</h2>
        <ScaleRow options={ENERGY_OPTIONS} value={morningEnergy} onSelect={setMorningEnergy} />
      </section>

      <section className="premium-card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">What's today's main focus?</h2>
        <input
          type="text"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="e.g. Finish the report, rest, be present at dinner…"
          maxLength={80}
          className="w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </section>

      <button onClick={submit} disabled={!canSubmit} className="btn-primary w-full">
        <Icon name="Sunrise" size={18} /> {existing ? 'Update check-in' : 'Save and start the day'}
      </button>
    </div>
  );
}
