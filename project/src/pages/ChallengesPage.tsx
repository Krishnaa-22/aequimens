import { Icon } from '../components/Icon';
import { useChallenges, useHabits, useToast } from '../hooks';
import { CHALLENGE_TEMPLATES } from '../data/challenges';
import { todayISO } from '../utils/format';
import type { ChallengeTemplate } from '../types';

function addDays(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function ChallengesPage() {
  const { challenges, save: saveChallenge } = useChallenges();
  const { save: saveHabit } = useHabits();
  const { show } = useToast();

  const activeTemplateIds = new Set(challenges.filter((c) => c.active).map((c) => c.templateId));

  const join = (template: ChallengeTemplate) => {
    const today = todayISO();
    const habitId = `habit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    saveHabit({
      id: habitId,
      title: template.habit.title,
      category: template.habit.category,
      target: template.habit.target,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      difficulty: template.habit.difficulty,
      active: true,
      createdAt: new Date().toISOString(),
      icon: template.habit.icon,
    });
    saveChallenge({
      id: `challenge_${Date.now()}`,
      templateId: template.id,
      habitId,
      startDate: today,
      endDate: addDays(today, template.durationDays - 1),
      completedDates: [],
      active: true,
    });
    show(`Joined ${template.name} — a matching habit was added`, 'success');
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-6 md:py-12 animate-fadeIn">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Challenges</p>
        <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Guided week-long challenges</h1>
        <p className="mt-1.5 text-sm text-ink-soft">Joining adds a matching daily habit for the challenge's duration.</p>
      </header>

      <div className="space-y-3">
        {CHALLENGE_TEMPLATES.map((template) => {
          const joined = activeTemplateIds.has(template.id);
          const participation = challenges.find((c) => c.templateId === template.id && c.active);

          return (
            <div key={template.id} className="premium-card p-5">
              <div className="flex items-start gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl olive-shine text-white">
                  <Icon name={template.icon} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-ink">{template.name}</h2>
                    <span className="chip !py-0.5 border-silver text-[11px]">{template.durationDays} days</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{template.description}</p>
                  {joined && participation ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-olive-primary">
                      <Icon name="CheckCircle" size={13} /> Active until {participation.endDate}
                    </p>
                  ) : (
                    <button onClick={() => join(template)} className="btn-primary mt-3 !px-4 !py-2 text-sm">
                      <Icon name="Plus" size={14} /> Join challenge
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
