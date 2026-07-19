import { useState } from 'react';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { useGoals, useHistory, useToast } from '../hooks';
import { goalProgress } from '../engine/personalization';
import type { GoalCategory, PersonalGoal } from '../types';

const GOAL_TEMPLATES: { category: GoalCategory; title: string; target: string; icon: string }[] = [
  { category: 'sleep', title: 'Build a steadier sleep rhythm', target: 'Reach 7+ hours more consistently', icon: 'MoonStar' },
  { category: 'stress', title: 'Create more recovery space', target: 'Keep stress in a moderate range', icon: 'Wind' },
  { category: 'energy', title: 'Feel more energised', target: 'Improve average daily energy', icon: 'Zap' },
  { category: 'screen', title: 'Reduce evening screen use', target: 'Keep pre-sleep screen use under 30 minutes', icon: 'Smartphone' },
  { category: 'activity', title: 'Move more regularly', target: 'Reach 20 active minutes on more days', icon: 'Footprints' },
  { category: 'hydration', title: 'Stay more hydrated', target: 'Reach at least 5 glasses on more days', icon: 'Droplets' },
  { category: 'outdoor', title: 'Spend more time outdoors', target: 'Log 15 outdoor minutes on more days', icon: 'TreePine' },
  { category: 'routine', title: 'Build a reliable daily rhythm', target: 'Complete at least two-thirds of daily plans', icon: 'ListTodo' },
];

export function GoalsPage() {
  const { goals, save, remove } = useGoals();
  const { history } = useHistory();
  const { show } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PersonalGoal | null>(null);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState<GoalCategory>('custom');
  const [weeks, setWeeks] = useState(4);

  const openTemplate = (template: (typeof GOAL_TEMPLATES)[number]) => {
    setEditing(null);
    setTitle(template.title);
    setTarget(template.target);
    setCategory(template.category);
    setWeeks(4);
    setFormOpen(true);
  };

  const openEdit = (goal: PersonalGoal) => {
    setEditing(goal);
    setTitle(goal.title);
    setTarget(goal.target);
    setCategory(goal.category);
    setWeeks(goal.timeframeWeeks);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setTitle('');
    setTarget('');
    setCategory('custom');
    setWeeks(4);
  };

  const saveGoal = () => {
    if (!title.trim() || !target.trim()) return;
    const goal: PersonalGoal = editing
      ? { ...editing, title: title.trim(), target: target.trim(), category, timeframeWeeks: weeks }
      : {
          id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          title: title.trim(),
          target: target.trim(),
          category,
          timeframeWeeks: weeks,
          active: true,
          createdAt: new Date().toISOString(),
        };
    save(goal);
    show(editing ? 'Goal updated' : 'Goal added', 'success');
    closeForm();
  };

  const activeGoals = goals.filter((goal) => goal.active);
  const inactiveGoals = goals.filter((goal) => !goal.active);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Personal goals</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Build towards better days</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Goals guide your daily focus. Progress is calculated only from real check-ins and stays on this device.
          </p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary shrink-0 !px-4 !py-2.5 text-sm">
          <Icon name="Plus" size={16} /> New goal
        </button>
      </header>

      {formOpen && (
        <section className="premium-card mb-6 p-5 animate-fadeIn">
          <h2 className="mb-4 text-sm font-semibold text-ink">{editing ? 'Edit goal' : 'Create a goal'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-ink-soft sm:col-span-2">
              Goal title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={70}
                placeholder="What would you like to improve?"
                className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
              />
            </label>
            <label className="block text-xs font-medium text-ink-soft sm:col-span-2">
              What would progress look like?
              <input
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                maxLength={100}
                placeholder="Keep it clear and realistic"
                className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
              />
            </label>
            <label className="block text-xs font-medium text-ink-soft">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as GoalCategory)}
                className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
              >
                {['sleep', 'stress', 'energy', 'screen', 'routine', 'activity', 'hydration', 'outdoor', 'social', 'custom'].map((item) => (
                  <option key={item} value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-ink-soft">
              Timeframe
              <select
                value={weeks}
                onChange={(event) => setWeeks(Number(event.target.value))}
                className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none"
              >
                {[2, 4, 6, 8, 12].map((value) => <option key={value} value={value}>{value} weeks</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={closeForm} className="btn-secondary flex-1">Cancel</button>
            <button onClick={saveGoal} disabled={!title.trim() || !target.trim()} className="btn-primary flex-1">
              <Icon name="Check" size={16} /> Save goal
            </button>
          </div>
        </section>
      )}

      {goals.length === 0 && !formOpen ? (
        <>
          <EmptyState
            icon="Target"
            title="No personal goals yet"
            description="Choose a template below or create a goal that matters to you."
          />
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">Suggested starting points</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOAL_TEMPLATES.map((template) => (
                <button
                  key={template.category}
                  onClick={() => openTemplate(template)}
                  className="flex items-center gap-3 rounded-2xl border border-silver bg-white p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-olive-soft/60"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-olive-tint text-olive-primary">
                    <Icon name={template.icon} size={19} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{template.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{template.target}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const progress = goalProgress(goal, history);
            return (
              <article key={goal.id} className="premium-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">{goal.title}</h2>
                      <span className="chip border-olive-soft/40 bg-olive-tint/50 text-olive-deep">{goal.category}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">{goal.target}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => openEdit(goal)} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Pencil" size={16} /></button>
                    <button onClick={() => save({ ...goal, active: false })} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Pause" size={16} /></button>
                    <button onClick={() => remove(goal.id)} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Trash2" size={16} /></button>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-ink-soft">
                    <span>Real-data progress</span>
                    <span>{history.length === 0 ? 'No data yet' : `${progress}%`}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-silver-light">
                    <div className="h-full rounded-full bg-olive-shine transition-all" style={{ width: `${history.length === 0 ? 0 : progress}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                    {history.length === 0
                      ? 'Complete check-ins to begin measuring this goal.'
                      : `Based on your most recent check-ins across this ${goal.timeframeWeeks}-week goal.`}
                  </p>
                </div>
              </article>
            );
          })}

          {inactiveGoals.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Paused goals</h2>
              <div className="space-y-2">
                {inactiveGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between rounded-2xl border border-silver bg-white p-4 opacity-70">
                    <div>
                      <p className="text-sm font-semibold text-ink">{goal.title}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{goal.target}</p>
                    </div>
                    <button onClick={() => save({ ...goal, active: true })} className="btn-secondary !px-3 !py-2 text-xs"><Icon name="Play" size={14} /> Resume</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
