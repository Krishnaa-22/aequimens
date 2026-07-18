import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Contributor, ImpactLevel, Mission } from '../types';
import { useCheckIns, useTodaysMissions } from '../hooks';
import { WellnessScoreRing } from '../components/WellnessScoreRing';
import { ContributorCard } from '../components/ContributorCard';
import { MissionCard } from '../components/MissionCard';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { categoryLabel } from '../engine/scoring';
import { QUESTION_BY_ID } from '../engine/questions';
import { todayISO } from '../utils/format';

export function SnapshotPage() {
  const navigate = useNavigate();
  const { checkIns } = useCheckIns();
  const today = todayISO();
  const { set, update, replace } = useTodaysMissions(today);
  const latest = checkIns.find((checkIn) => checkIn.date === today) ?? null;
  const [showWhy, setShowWhy] = useState(false);

  if (!latest) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <EmptyState
          icon="Sparkles"
          title="No snapshot yet"
          description="Complete a check-in to see your wellness snapshot, likely contributors, and today's missions."
          action={
            <button onClick={() => navigate('/check-in')} className="btn-primary">
              Begin Check-In
            </button>
          }
        />
      </div>
    );
  }

  const negative = latest.contributors.filter((c) => c.direction === 'negative');
  const positive = latest.contributors.filter((c) => c.direction === 'positive');

  const grouped: Record<ImpactLevel, Contributor[]> = {
    high: negative.filter((c) => c.impact === 'high'),
    moderate: negative.filter((c) => c.impact === 'moderate'),
    small: negative.filter((c) => c.impact === 'small'),
  };

  const domainCards = (['mood', 'energy', 'stress', 'sleep', 'motivation'] as const).map((cat) => ({
    cat,
    score: latest.domainScores[cat],
  }));

  const missions = set?.missions ?? latest.missions;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Today's snapshot</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Your wellness snapshot</h1>
        </div>
        <button
          onClick={() => navigate('/app')}
          className="rounded-2xl border border-silver bg-white px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Go to dashboard
        </button>
      </div>

      <section className="premium-card mb-6 flex flex-col items-center p-7 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-lg font-semibold text-ink">Overall wellness</h2>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-ink-soft">
            Based on today's responses. A general estimate, not a medical score.
          </p>
        </div>
        <WellnessScoreRing score={latest.overall} label="Wellness" />
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {domainCards.map(({ cat, score }) => (
          <div key={cat} className="rounded-2xl border border-silver bg-white p-3.5 text-center">
            <p className="text-xs font-medium text-ink-soft">{categoryLabel(cat)}</p>
            <p className="mt-1.5 text-2xl font-bold text-ink">{score}</p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-silver-light">
              <div className="h-full rounded-full bg-olive-soft" style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="premium-card mb-6 p-6">
        <h2 className="mb-2 text-base font-semibold text-ink">What this may mean</h2>
        <p className="text-sm leading-relaxed text-ink-soft">{latest.explanation}</p>

        <button
          onClick={() => setShowWhy((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-olive-primary transition-colors hover:text-olive-deep"
          aria-expanded={showWhy}
        >
          <Icon name="Info" size={16} />
          Why am I seeing this?
          <Icon name="ChevronDown" size={15} className={`transition-transform ${showWhy ? 'rotate-180' : ''}`} />
        </button>

        {showWhy && (
          <div className="mt-4 space-y-2.5 border-t border-silver/60 pt-4 animate-fadeIn">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">How your answers shaped this</p>
            {Object.values(latest.answers).map((a) => {
              const q = QUESTION_BY_ID[a.questionId];
              return (
                <div key={a.questionId} className="flex items-start justify-between gap-3 rounded-xl bg-silver-light/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-soft">{q?.text}</p>
                    <p className="text-sm font-medium text-ink">{a.label}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-olive-primary">{a.score}/5</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-ink">Likely lifestyle contributors</h2>
        {negative.length === 0 ? (
          <p className="rounded-2xl border border-silver bg-white p-4 text-sm text-ink-soft">
            No strong negative contributors showed up in today's responses.
          </p>
        ) : (
          <div className="space-y-3">
            {(['high', 'moderate', 'small'] as ImpactLevel[]).map((level) =>
              grouped[level].length > 0 ? (
                <div key={level}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    {level === 'high' ? 'High impact' : level === 'moderate' ? 'Moderate impact' : 'Smaller impact'}
                  </p>
                  <div className="space-y-2.5">
                    {grouped[level].map((c) => (
                      <ContributorCard key={c.id} contributor={c} />
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}

        {positive.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-olive-primary">Supporting you today</p>
            <div className="space-y-2.5">
              {positive.map((c) => (
                <ContributorCard key={c.id} contributor={c} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Small steps for today</h2>
          <span className="text-xs text-ink-soft">Three personalised missions</span>
        </div>
        <div className="space-y-2.5">
          {missions.map((m) => (
            <MissionCard
              key={m.id}
              mission={m}
              onToggle={() => update(m.id, { completed: !m.completed })}
              onReplace={(rep: Mission) => replace(m.id, rep)}
              onEdit={(name: string) => update(m.id, { name })}
              contributors={latest.contributors}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          <Icon name="Scale" size={13} className="mr-1 inline" />
          Consistency matters more than perfection.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={() => navigate('/missions')} className="btn-primary flex-1">
          View my mission checklist
          <Icon name="ArrowRight" size={18} />
        </button>
        <button onClick={() => navigate('/app')} className="btn-secondary flex-1">
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
