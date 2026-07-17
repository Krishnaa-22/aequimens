import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoMark, Wordmark } from '../components/LogoMark';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/welcome'), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <div className="flex animate-fadeInScale flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-olive-tint/50 blur-2xl" />
          <div className="relative animate-fadeIn">
            <LogoMark size={88} />
          </div>
        </div>
        <div className="mt-8 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <Wordmark size={22} className="text-ink" />
        </div>
        <p
          className="mt-3 animate-fadeIn text-sm text-ink-soft"
          style={{ animationDelay: '700ms' }}
        >
          Understand your patterns. Restore your balance.
        </p>
      </div>

      <div className="absolute bottom-10 flex items-center gap-2 text-xs text-silver-dark animate-fadeIn" style={{ animationDelay: '1200ms' }}>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-olive-primary" />
        Private by design
      </div>
    </div>
  );
}
