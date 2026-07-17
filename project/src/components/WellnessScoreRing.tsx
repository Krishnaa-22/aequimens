import { useEffect, useState } from 'react';

interface WellnessScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

export function WellnessScoreRing({
  score,
  size = 180,
  strokeWidth = 14,
  label = 'Wellness',
  sublabel,
  animate = true,
}: WellnessScoreRingProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayed(score);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  const tone =
    displayed >= 70 ? '#667A3E' : displayed >= 50 ? '#9BAE70' : displayed >= 30 ? '#888E8B' : '#3E4A27';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label} score: ${score} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7B77D" />
            <stop offset="55%" stopColor="#667A3E" />
            <stop offset="100%" stopColor="#3E4A27" />
          </linearGradient>
          <linearGradient id="ring-track" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EEF0EF" />
            <stop offset="100%" stopColor="#C5C8C6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-track)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: animate ? 'stroke-dashoffset 0.1s linear' : undefined }}
        />
        {/* subtle metallic highlight */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(244,245,244,0.45)"
          strokeWidth={1}
          strokeDasharray={`${circumference * 0.18} ${circumference}`}
          strokeDashoffset={circumference * 0.05}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold leading-none text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {displayed}
        </span>
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">/ 100</span>
        <span className="mt-1.5 text-xs font-medium" style={{ color: tone }}>
          {label}
        </span>
        {sublabel && <span className="mt-0.5 text-[11px] text-ink-soft">{sublabel}</span>}
      </div>
    </div>
  );
}
