import { useState } from 'react';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { useRoutines, useToast } from '../hooks';
import { todayISO } from '../utils/format';
import type { Routine, RoutineItem, RoutineType, WeekdayIndex } from '../types';

const DAYS: { id: WeekdayIndex; label: string }[] = [
  { id: 1, label: 'M' }, { id: 2, label: 'T' }, { id: 3, label: 'W' },
  { id: 4, label: 'T' }, { id: 5, label: 'F' }, { id: 6, label: 'S' }, { id: 0, label: 'S' },
];

const STARTERS: { name: string; type: RoutineType; reminderTime: string; items: string[] }[] = [
  { name: 'Gentle morning', type: 'morning', reminderTime: '07:30', items: ['Drink water', 'Open the curtains', 'Eat something', 'Review today’s focus'] },
  { name: 'Calmer night', type: 'evening', reminderTime: '22:15', items: ['Prepare for tomorrow', 'Reduce screens', 'Evening reflection', 'Settle into bed'] },
];

export function RoutinesPage() {
  const { routines, save, remove, toggleItem, isItemCompleted } = useRoutines();
  const { show } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<RoutineType>('custom');
  const [reminderTime, setReminderTime] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [days, setDays] = useState<WeekdayIndex[]>([1, 2, 3, 4, 5, 6, 0]);
  const today = todayISO();
  const weekday = new Date().getDay() as WeekdayIndex;

  const openStarter = (starter: (typeof STARTERS)[number]) => {
    setEditing(null);
    setName(starter.name);
    setType(starter.type);
    setReminderTime(starter.reminderTime);
    setItemsText(starter.items.join('\n'));
    setDays([1, 2, 3, 4, 5, 6, 0]);
    setFormOpen(true);
  };

  const openEdit = (routine: Routine) => {
    setEditing(routine);
    setName(routine.name);
    setType(routine.type);
    setReminderTime(routine.reminderTime ?? '');
    setItemsText(routine.items.map((item) => item.title).join('\n'));
    setDays(routine.daysOfWeek);
    setFormOpen(true);
  };

  const close = () => {
    setFormOpen(false);
    setEditing(null);
    setName('');
    setType('custom');
    setReminderTime('');
    setItemsText('');
    setDays([1, 2, 3, 4, 5, 6, 0]);
  };

  const persist = () => {
    const titles = itemsText.split('\n').map((item) => item.trim()).filter(Boolean).slice(0, 10);
    if (!name.trim() || titles.length === 0 || days.length === 0) return;
    const oldByTitle = new Map(editing?.items.map((item) => [item.title, item]) ?? []);
    const items: RoutineItem[] = titles.map((title) => oldByTitle.get(title) ?? {
      id: `routine_item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
    });
    const routine: Routine = editing
      ? { ...editing, name: name.trim(), type, reminderTime, daysOfWeek: days, items }
      : {
          id: `routine_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: name.trim(),
          type,
          reminderTime,
          daysOfWeek: days,
          items,
          active: true,
          createdAt: new Date().toISOString(),
        };
    save(routine);
    show(editing ? 'Routine updated' : 'Routine created', 'success');
    close();
  };

  const toggleDay = (day: WeekdayIndex) => {
    setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  };

  const scheduledToday = routines.filter((routine) => routine.active && routine.daysOfWeek.includes(weekday));
  const other = routines.filter((routine) => !scheduledToday.some((item) => item.id === routine.id));

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Routine builder</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Give your day a softer structure</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Reusable morning, night, or custom routines. Tick only what is useful today.
          </p>
        </div>
        {!formOpen && <button onClick={() => setFormOpen(true)} className="btn-primary shrink-0 !px-4 !py-2.5 text-sm"><Icon name="Plus" size={16} /> New</button>}
      </header>

      {formOpen && (
        <section className="premium-card mb-6 p-5 animate-fadeIn">
          <h2 className="mb-4 text-sm font-semibold text-ink">{editing ? 'Edit routine' : 'Create a routine'}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-ink-soft sm:col-span-2">
              Routine name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Calm start" maxLength={50} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none" />
            </label>
            <label className="block text-xs font-medium text-ink-soft">
              Type
              <select value={type} onChange={(event) => setType(event.target.value as RoutineType)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none">
                <option value="morning">Morning</option><option value="evening">Evening</option><option value="custom">Custom</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-ink-soft">
              Reminder time (optional)
              <input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} className="mt-1.5 w-full rounded-2xl border border-silver bg-white px-4 py-3 text-sm text-ink focus:border-olive-primary focus:outline-none" />
            </label>
            <label className="block text-xs font-medium text-ink-soft sm:col-span-2">
              Routine items — one per line
              <textarea value={itemsText} onChange={(event) => setItemsText(event.target.value)} rows={6} placeholder={'Drink water\nOpen the curtains\nEat breakfast'} className="mt-1.5 w-full resize-none rounded-2xl border border-silver bg-white px-4 py-3 text-sm leading-relaxed text-ink focus:border-olive-primary focus:outline-none" />
            </label>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-ink-soft">Days of week</p>
            <div className="flex gap-2">
              {DAYS.map((day) => <button key={day.id} type="button" onClick={() => toggleDay(day.id)} className={`h-10 w-10 rounded-full text-xs font-semibold ${days.includes(day.id) ? 'bg-olive-primary text-white' : 'border border-silver bg-white text-ink-soft'}`}>{day.label}</button>)}
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={close} className="btn-secondary flex-1">Cancel</button>
            <button onClick={persist} disabled={!name.trim() || !itemsText.trim() || days.length === 0} className="btn-primary flex-1"><Icon name="Check" size={16} /> Save routine</button>
          </div>
        </section>
      )}

      {routines.length === 0 && !formOpen ? (
        <>
          <EmptyState icon="ListTodo" title="No routines yet" description="Start with a gentle template or make your own routine." />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {STARTERS.map((starter) => (
              <button key={starter.name} onClick={() => openStarter(starter)} className="rounded-3xl border border-silver bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-olive-soft/60">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-olive-tint text-olive-primary"><Icon name={starter.type === 'morning' ? 'Sunrise' : 'MoonStar'} size={20} /></span>
                <h2 className="mt-4 text-base font-semibold text-ink">{starter.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">{starter.items.join(' · ')}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-7">
          {scheduledToday.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">Scheduled today</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {scheduledToday.map((routine) => <RoutineCard key={routine.id} routine={routine} today={today} isItemCompleted={isItemCompleted} onToggle={toggleItem} onEdit={() => openEdit(routine)} onPause={() => save({ ...routine, active: false })} onDelete={() => remove(routine.id)} />)}
              </div>
            </section>
          )}
          {other.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">Other routines</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {other.map((routine) => <RoutineCard key={routine.id} routine={routine} today={today} isItemCompleted={isItemCompleted} onToggle={toggleItem} onEdit={() => openEdit(routine)} onPause={() => save({ ...routine, active: !routine.active })} onDelete={() => remove(routine.id)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function RoutineCard({ routine, today, isItemCompleted, onToggle, onEdit, onPause, onDelete }: { routine: Routine; today: string; isItemCompleted: (routineId: string, itemId: string, date: string) => boolean; onToggle: (routineId: string, itemId: string, date: string, completed: boolean) => void; onEdit: () => void; onPause: () => void; onDelete: () => void }) {
  const completed = routine.items.filter((item) => isItemCompleted(routine.id, item.id, today)).length;
  const percent = Math.round((completed / Math.max(1, routine.items.length)) * 100);
  return (
    <article className={`premium-card p-5 ${routine.active ? '' : 'opacity-65'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-tint text-olive-primary"><Icon name={routine.type === 'morning' ? 'Sunrise' : routine.type === 'evening' ? 'MoonStar' : 'ListTodo'} size={18} /></span>
          <h3 className="mt-3 text-base font-semibold text-ink">{routine.name}</h3>
          <p className="mt-1 text-xs text-ink-soft">{routine.reminderTime ? `${routine.reminderTime} · ` : ''}{completed}/{routine.items.length} complete</p>
        </div>
        <div className="flex gap-1">
          <button onClick={onEdit} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Pencil" size={15} /></button>
          <button onClick={onPause} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name={routine.active ? 'Pause' : 'Play'} size={15} /></button>
          <button onClick={onDelete} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Trash2" size={15} /></button>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-silver-light"><div className="h-full rounded-full bg-olive-shine" style={{ width: `${percent}%` }} /></div>
      <div className="mt-4 space-y-2">
        {routine.items.map((item) => {
          const done = isItemCompleted(routine.id, item.id, today);
          return (
            <button key={item.id} type="button" disabled={!routine.active} onClick={() => onToggle(routine.id, item.id, today, !done)} className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ${done ? 'border-olive-soft/50 bg-olive-tint/50' : 'border-silver bg-white'} ${routine.active ? '' : 'cursor-not-allowed'}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${done ? 'bg-olive-primary text-white' : 'border border-silver text-transparent'}`}><Icon name="Check" size={14} /></span>
              <span className={`text-sm ${done ? 'text-ink line-through decoration-olive-soft' : 'text-ink'}`}>{item.title}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
