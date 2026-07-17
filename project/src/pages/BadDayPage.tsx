import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';

const GENTLE_STEPS = [
  { icon: 'Wind', title: 'Take a slow breath', text: 'Breathe in for four counts, out for six. A few rounds is enough.' },
  { icon: 'GlassWater', title: 'Drink some water', text: 'A small sip can be a quiet act of care.' },
  { icon: 'Armchair', title: 'Sit somewhere comfortable', text: 'Let yourself rest for a moment without a goal.' },
  { icon: 'TreePine', title: 'Step outside briefly', text: 'Even a minute of fresh air and daylight can help.' },
  { icon: 'MessageCircle', title: 'Contact someone you trust', text: 'A short message or call. You do not have to explain everything.' },
  { icon: 'Scale', title: 'Reduce today’s mission difficulty', text: "Lower the bar. Today's missions can wait or shrink." },
];

export function BadDayPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-6 md:py-16">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
          <Icon name="Heart" size={28} />
        </div>
        <h1 className="text-balance text-2xl font-bold text-ink md:text-3xl">I'm having a difficult day.</h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-sm leading-relaxed text-ink-soft">
          That is okay. You do not have to complete everything today. No scores, charts, or streaks will
          show here — just a few gentle things that might help.
        </p>
      </header>

      {/* Breathing prompt */}
      <section className="premium-card mb-6 flex flex-col items-center p-8 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-breathe rounded-full bg-olive-soft/40" />
          <div className="absolute inset-4 animate-breathe rounded-full bg-olive-primary/40" style={{ animationDelay: '0.5s' }} />
          <span className="relative text-sm font-medium text-olive-deep">Breathe</span>
        </div>
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
          In for four, out for six. Follow the soft circles if it feels right.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {GENTLE_STEPS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-silver bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-olive-tint text-olive-primary">
              <Icon name={s.icon} size={20} />
            </div>
            <p className="text-sm font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-olive-soft/40 bg-olive-tint/40 p-5 text-center">
        <p className="text-sm font-medium text-olive-deep">You do not have to complete everything today.</p>
        <p className="mt-1.5 text-xs text-ink-soft">Small, gentle things count. Tomorrow is a fresh check-in.</p>
      </div>

      <div className="mt-6 rounded-2xl border border-silver bg-silver-light/50 p-4">
        <div className="flex items-start gap-3">
          <Icon name="ShieldAlert" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
          <p className="text-xs leading-relaxed text-ink-soft">
            If you feel unsafe or unable to cope, contact local emergency services or a qualified
            mental-health professional. Aequimens is not crisis care.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button onClick={() => navigate('/app')} className="btn-secondary">
          <Icon name="ArrowLeft" size={16} /> Back to home
        </button>
      </div>
    </div>
  );
}
