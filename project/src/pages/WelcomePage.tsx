import { useNavigate } from 'react-router-dom';
import { LogoMark, Wordmark } from '../components/LogoMark';
import { Icon } from '../components/Icon';
import { PrivacyBadge } from '../components/Feedback';
import { storage } from '../data/localStorage';

export function WelcomePage() {
  const navigate = useNavigate();

  const beginCheckIn = () => {
    storage.setOnboarded(true);
    navigate('/check-in');
  };

  const hasProgress = storage.getHistory().length > 0;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 md:py-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark size={36} />
            <Wordmark size={13} className="text-ink" />
          </div>
          <PrivacyBadge />
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          {/* Hero card */}
          <section className="relative overflow-hidden rounded-3xl bg-olive-shine p-8 text-white shadow-soft-lg md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <LogoMark size={48} />
              </div>
              <h1 className="text-balance text-3xl font-bold leading-tight md:text-5xl">
                Understand your patterns.
                <br />
                Restore your balance.
              </h1>
              <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-white/85 md:text-base">
                A private daily check-in that helps you understand what may be shaping your mood,
                energy, stress, and everyday wellbeing.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={beginCheckIn}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-olive-deep shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
                >
                  Begin Check-In
                  <Icon name="ArrowRight" size={18} />
                </button>
                <button
                  onClick={() => navigate('/app')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  View My Progress
                </button>
              </div>
            </div>
          </section>

          {/* Value props */}
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: 'Sparkles', title: 'Daily check-in', text: 'A calm, two-minute reflection on how today feels.' },
              { icon: 'TrendingUp', title: 'Clear patterns', text: 'See which lifestyle factors may be shaping your wellbeing.' },
              { icon: 'ListChecks', title: 'Gentle missions', text: 'Three small, personalised steps each day.' },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-silver bg-white/80 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-olive-tint text-olive-primary">
                  <Icon name={v.icon} size={20} />
                </div>
                <p className="text-sm font-semibold text-ink">{v.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{v.text}</p>
              </div>
            ))}
          </section>

          {/* Disclaimer */}
          <section className="mt-8 rounded-2xl border border-silver bg-silver-light/40 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-ink-soft">
                <Icon name="Info" size={16} />
              </span>
              <p className="text-xs leading-relaxed text-ink-soft">
                Aequimens provides general wellness insights and does not diagnose, treat, or replace
                medical or mental-health care. {hasProgress ? '' : 'Your responses stay on this device.'}
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
