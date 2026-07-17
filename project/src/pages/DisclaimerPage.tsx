import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LogoMark, Wordmark } from '../components/LogoMark';

export function DisclaimerPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:px-6 md:py-16">
      <div className="mb-6 flex items-center gap-3">
        <LogoMark size={40} />
        <Wordmark size={14} className="text-ink" />
      </div>

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Legal</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Wellness disclaimer</h1>
      </header>

      <div className="premium-card space-y-4 p-6 text-sm leading-relaxed text-ink-soft">
        <p>
          Aequimens provides <strong className="text-ink">general wellness insights</strong> based on
          your self-reported daily check-ins. It is designed to help you notice patterns between mood,
          energy, stress, sleep, and everyday lifestyle habits.
        </p>
        <p>
          Aequimens <strong className="text-ink">does not diagnose</strong> diseases, depression,
          anxiety, or any medical or mental-health condition. It does not detect disorders, and it does
          not claim to cure, treat, or replace medical or mental-health care.
        </p>
        <p>
          Any phrasing such as "likely contributor", "may be influencing", "based on today's responses",
          or "worth monitoring" describes <strong className="text-ink">possible lifestyle patterns</strong>,
          not medical causes or diagnoses.
        </p>
        <p>
          If you feel unsafe, persistently low, or unable to cope, please contact local emergency
          services or a qualified mental-health professional. Aequimens is <strong className="text-ink">not
          crisis care</strong>.
        </p>
        <p>
          Your data stays on your device by default. No account is required. Cloud sync may be added
          later as an optional, opt-in feature.
        </p>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-silver bg-silver-light/40 p-4">
        <Icon name="Info" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
        <p className="text-xs leading-relaxed text-ink-soft">
          By using Aequimens you acknowledge that it is a wellness companion, not a medical product.
        </p>
      </div>

      <div className="mt-6">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <Icon name="ArrowLeft" size={16} /> Back
        </button>
      </div>
    </div>
  );
}
