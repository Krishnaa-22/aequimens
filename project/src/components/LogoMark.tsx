interface LogoMarkProps {
  size?: number;
  className?: string;
  withShine?: boolean;
}

/**
 * Aequimens logo mark: two balanced curved shapes forming an "A"
 * with a balanced pathway between them. Metallic olive with silver highlights.
 */
export function LogoMark({ size = 48, className, withShine = true }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <linearGradient id="aeq-olive" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#A7B77D" />
          <stop offset="50%" stopColor="#667A3E" />
          <stop offset="100%" stopColor="#3E4A27" />
        </linearGradient>
        <linearGradient id="aeq-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4F5F4" />
          <stop offset="60%" stopColor="#C5C8C6" />
          <stop offset="100%" stopColor="#888E8B" />
        </linearGradient>
        {withShine && (
          <linearGradient id="aeq-shine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        )}
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#aeq-olive)" />
      <rect width="64" height="64" rx="16" fill="url(#aeq-silver)" opacity="0.12" />
      {/* Left curve of the A */}
      <path
        d="M20 48 L30 18 Q31.5 14 34 14 L34 48"
        stroke="url(#aeq-silver)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right curve of the A, mirrored */}
      <path
        d="M44 48 L34 18"
        stroke="url(#aeq-silver)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Balanced crossbar — a gentle pathway */}
      <path
        d="M24.5 38 Q32 36 39.5 38"
        stroke="url(#aeq-silver)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* small balance dot */}
      <circle cx="32" cy="22" r="2.2" fill="url(#aeq-silver)" />
      {withShine && <rect width="64" height="32" rx="16" fill="url(#aeq-shine)" opacity="0.5" />}
    </svg>
  );
}

export function Wordmark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontSize: size,
        letterSpacing: '0.18em',
        fontWeight: 700,
      }}
    >
      AEQUIMENS
    </span>
  );
}
