import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/LogoMark';

const MESSAGES = [
  'Understanding today’s check-in',
  'Comparing lifestyle factors',
  'Finding likely contributors',
  'Preparing your daily plan',
];

export function ProcessingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= MESSAGES.length) {
      const t = setTimeout(() => navigate('/snapshot'), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 850);
    return () => clearTimeout(t);
  }, [step, navigate]);

  const ringSize = 140;
  const radius = (ringSize - 12) / 2;
  const circ = 2 * Math.PI * radius;
  const progress = Math.min(1, step / MESSAGES.length);
  const offset = circ - progress * circ;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <defs>
              <linearGradient id="proc-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A7B77D" />
                <stop offset="100%" stopColor="#3E4A27" />
              </linearGradient>
            </defs>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={radius} fill="none" stroke="#E6E8E7" strokeWidth={12} />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="url(#proc-ring)"
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoMark size={52} withShine={false} />
          </div>
        </div>

        <div className="mt-8 h-6">
          <p key={step} className="animate-fadeIn text-sm font-medium text-ink-soft">
            {MESSAGES[Math.min(step, MESSAGES.length - 1)]}…
          </p>
        </div>

        <p className="mt-2 text-xs text-silver-dark">
          General wellness analysis — not a medical assessment.
        </p>
      </div>
    </div>
  );
}
