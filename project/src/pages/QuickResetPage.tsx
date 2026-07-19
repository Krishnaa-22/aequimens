import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/Icon';

type ToolId = 'breathing' | 'water' | 'stretch' | 'outside' | 'pause';

interface Tool {
  id: ToolId;
  title: string;
  description: string;
  icon: string;
  durationSeconds?: number;
}

const TOOLS: Tool[] = [
  {
    id: 'breathing',
    title: '60-second breathing',
    description: 'A slow, guided breathing pause.',
    icon: 'Wind',
    durationSeconds: 60,
  },
  {
    id: 'water',
    title: 'Drink-water reminder',
    description: 'A gentle nudge to have a glass of water.',
    icon: 'GlassWater',
  },
  {
    id: 'stretch',
    title: 'Short stretch',
    description: 'A brief stretch to ease tension.',
    icon: 'PersonStanding',
    durationSeconds: 45,
  },
  {
    id: 'outside',
    title: 'Step outside',
    description: 'A short moment of fresh air and daylight.',
    icon: 'TreePine',
  },
  {
    id: 'pause',
    title: 'Quick pause',
    description: 'Just a moment to stop and reset.',
    icon: 'CircleDashed',
    durationSeconds: 30,
  },
];

function BreathingCircle({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const phaseTimer = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          onDone();
          return 0;
        }
        return r - 1;
      });
      phaseTimer.current += 1;
      setPhase(phaseTimer.current % 8 < 4 ? 'in' : 'out');
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center py-6">
      <div
        className="flex h-40 w-40 items-center justify-center rounded-full olive-shine text-white shadow-glow transition-transform duration-[4000ms] ease-in-out"
        style={{ transform: phase === 'in' ? 'scale(1.12)' : 'scale(0.88)' }}
      >
        <span className="text-lg font-semibold">{phase === 'in' ? 'Breathe in' : 'Breathe out'}</span>
      </div>
      <p className="mt-5 text-sm text-ink-soft">{remaining}s remaining</p>
    </div>
  );
}

function SimpleTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          onDone();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pct = 1 - remaining / seconds;
  return (
    <div className="flex flex-col items-center py-6">
      <svg width={120} height={120} className="-rotate-90">
        <circle cx={60} cy={60} r={52} fill="none" stroke="#E6E8E7" strokeWidth={10} />
        <circle
          cx={60}
          cy={60}
          r={52}
          fill="none"
          stroke="#667A3E"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 52}
          strokeDashoffset={2 * Math.PI * 52 * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <p className="mt-3 text-sm text-ink-soft">{remaining}s remaining</p>
    </div>
  );
}

export function QuickResetPage() {
  const [active, setActive] = useState<Tool | null>(null);
  const [done, setDone] = useState<ToolId | null>(null);

  return (
    <div className="mx-auto max-w-xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Quick reset</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">A short, supportive pause</h1>
        <p className="mt-1.5 text-sm text-ink-soft">Calm, simple tools — no tracking, no pressure.</p>
      </header>

      {active ? (
        <div className="premium-card p-6 text-center">
          <h2 className="text-base font-semibold text-ink">{active.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{active.description}</p>

          {active.id === 'breathing' && active.durationSeconds && (
            <BreathingCircle seconds={active.durationSeconds} onDone={() => setDone(active.id)} />
          )}
          {active.id !== 'breathing' && active.durationSeconds && (
            <SimpleTimer seconds={active.durationSeconds} onDone={() => setDone(active.id)} />
          )}
          {!active.durationSeconds && (
            <div className="flex flex-col items-center py-8">
              <Icon name={active.icon} size={56} className="text-olive-primary" />
              <p className="mt-4 max-w-xs text-sm text-ink-soft">
                Take your time — there's nothing to track here.
              </p>
            </div>
          )}

          {done === active.id ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-olive-primary">
              <Icon name="CheckCircle" size={16} /> Nicely done.
            </p>
          ) : null}

          <button
            onClick={() => {
              setActive(null);
              setDone(null);
            }}
            className="btn-secondary mt-5"
          >
            Back to tools
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActive(tool);
                setDone(null);
              }}
              className="premium-card flex flex-col items-start p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-olive-tint text-olive-primary">
                <Icon name={tool.icon} size={22} />
              </span>
              <h2 className="text-sm font-semibold text-ink">{tool.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{tool.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
