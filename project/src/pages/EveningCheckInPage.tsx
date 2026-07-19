import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useEveningCheckIns, useHabits, useToast } from '../hooks';
import { todayISO } from '../utils/format';

const MOOD_OPTIONS = [
  { value: 1, label: 'Low', icon: 'Frown' },
  { value: 2, label: 'Flat', icon: 'Meh' },
  { value: 3, label: 'Okay', icon: 'Smile' },
  { value: 4, label: 'Good', icon: 'Smile' },
  { value: 5, label: 'Great', icon: 'Sparkles' },
];

const STRESS_OPTIONS = [
  { value: 1, label: 'Calm', icon: 'Leaf' },
  { value: 2, label: 'Mild', icon: 'Wind' },
  { value: 3, label: 'Some', icon: 'Waves' },
  { value: 4, label: 'High', icon: 'CloudLightning' },
  { value: 5, label: 'Very high', icon: 'Tornado' },
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

function TagInput({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState('');

  const add = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft('');
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span key={tag} className="chip border-olive-soft/40 bg-olive-tint/50 text-olive-deep">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
              <Icon name="X" size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder}
          maxLength={40}
          className="flex-1 rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
        <button type="button" onClick={() => add(draft)} className="btn-secondary !px-3 !py-2.5">
          <Icon name="Plus" size={16} />
        </button>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !value.includes(s))
            .slice(0, 5)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="rounded-full border border-silver bg-white px-2.5 py-1 text-xs text-ink-soft hover:border-olive-soft/60"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

export function EveningCheckInPage() {
  const navigate = useNavigate();
  const { save, todayEntry } = useEveningCheckIns();
  const { habits } = useHabits();
  const { show } = useToast();
  const today = todayISO();
  const existing = todayEntry(today);

  const [mood, setMood] = useState<number | null>(existing?.mood ?? null);
  const [stress, setStress] = useState<number | null>(existing?.stress ?? null);
  const [whatHelped, setWhatHelped] = useState<string[]>(existing?.whatHelped ?? []);
  const [whatWasHard, setWhatWasHard] = useState<string[]>(existing?.whatWasHard ?? []);
  const [reflection, setReflection] = useState(existing?.reflection ?? '');

  const habitSuggestions = habits.filter((h) => h.active).map((h) => h.title);
  const canSubmit = mood !== null && stress !== null;

  const submit = () => {
    if (!canSubmit || mood === null || stress === null) return;
    save({
      date: today,
      mood,
      stress,
      whatHelped,
      whatWasHard,
      reflection: reflection.trim() || undefined,
      completedAt: new Date().toISOString(),
    });
    show(existing ? 'Evening check-in updated' : 'Evening check-in saved', 'success');
    navigate('/app');
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Evening check-in</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">A gentle close to the day</h1>
        <p className="mt-1.5 text-sm text-ink-soft">Simple and short — just enough to reflect.</p>
      </header>

      <section className="premium-card mb-4 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">How's your mood tonight?</h2>
        <ScaleRow options={MOOD_OPTIONS} value={mood} onSelect={setMood} />
      </section>

      <section className="premium-card mb-4 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">How stressed did today feel?</h2>
        <ScaleRow options={STRESS_OPTIONS} value={stress} onSelect={setStress} />
      </section>

      <section className="premium-card mb-4 p-5">
        <h2 className="mb-1 text-sm font-semibold text-ink">What helped today?</h2>
        <p className="mb-3 text-xs text-ink-soft">Optional — this feeds your weekly summary over time.</p>
        <TagInput value={whatHelped} onChange={setWhatHelped} placeholder="e.g. a walk, a good night's sleep…" suggestions={habitSuggestions} />
      </section>

      <section className="premium-card mb-4 p-5">
        <h2 className="mb-1 text-sm font-semibold text-ink">What made today harder?</h2>
        <p className="mb-3 text-xs text-ink-soft">Optional.</p>
        <TagInput value={whatWasHard} onChange={setWhatWasHard} placeholder="e.g. poor sleep, a stressful meeting…" />
      </section>

      <section className="premium-card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">Anything else? (optional)</h2>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="A short reflection, if you'd like to write one…"
          maxLength={280}
          rows={3}
          className="w-full resize-none rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
        />
      </section>

      <button onClick={submit} disabled={!canSubmit} className="btn-primary w-full">
        <Icon name="MoonStar" size={18} /> {existing ? 'Update check-in' : 'Save and close the day'}
      </button>
    </div>
  );
}
