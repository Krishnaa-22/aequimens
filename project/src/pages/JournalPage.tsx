import { useState } from 'react';
import { EmptyState } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { useJournal, useToast } from '../hooks';
import { formatLongDate, todayISO } from '../utils/format';
import type { JournalEntry } from '../types';

const QUICK_TAGS = ['Studies', 'Work', 'Family', 'Friends', 'Sleep', 'Exercise', 'Outdoors', 'Rest'];
const HELP_TAGS = ['Better sleep', 'Talking to someone', 'Movement', 'Time outdoors', 'Music', 'Finishing a task', 'Quiet time'];

export function JournalPage() {
  const { entries, save, remove } = useJournal();
  const { show } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [text, setText] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [helped, setHelped] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const resetEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    setText('');
    setMood(undefined);
    setTags([]);
    setHelped([]);
  };

  const openEdit = (entry: JournalEntry) => {
    setEditing(entry);
    setText(entry.text);
    setMood(entry.mood);
    setTags(entry.contextTags);
    setHelped(entry.whatHelped);
    setEditorOpen(true);
  };

  const toggle = (value: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const saveEntry = () => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    const entry: JournalEntry = editing
      ? { ...editing, text: text.trim(), mood, contextTags: tags, whatHelped: helped, updatedAt: now }
      : {
          id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: todayISO(),
          text: text.trim(),
          mood,
          contextTags: tags,
          whatHelped: helped,
          createdAt: now,
          updatedAt: now,
        };
    save(entry);
    show(editing ? 'Journal entry updated' : 'Journal entry saved', 'success');
    resetEditor();
  };

  const filtered = entries.filter((entry) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      entry.text.toLowerCase().includes(query) ||
      entry.contextTags.some((tag) => tag.toLowerCase().includes(query)) ||
      entry.whatHelped.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">Private journal</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">Capture what shaped your day</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Short reflections, useful context, and what helped. Everything stays on this device.
          </p>
        </div>
        {!editorOpen && (
          <button onClick={() => setEditorOpen(true)} className="btn-primary shrink-0 !px-4 !py-2.5 text-sm">
            <Icon name="NotebookPen" size={16} /> Write
          </button>
        )}
      </header>

      {editorOpen && (
        <section className="premium-card mb-6 p-5 animate-fadeIn">
          <label className="block text-sm font-medium text-ink">
            What is on your mind?
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={6}
              maxLength={1200}
              placeholder="A sentence is enough. Keep it honest and simple."
              className="mt-2 w-full resize-none rounded-2xl border border-silver bg-white px-4 py-3 text-sm leading-relaxed text-ink focus:border-olive-primary focus:outline-none"
            />
          </label>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Optional mood</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMood(mood === value ? undefined : value)}
                  className={`rounded-2xl border px-2 py-3 text-center transition-all ${
                    mood === value ? 'border-olive-soft bg-olive-tint text-olive-deep' : 'border-silver bg-white text-ink-soft'
                  }`}
                >
                  <Icon name={value <= 2 ? 'Frown' : value === 3 ? 'Meh' : 'Smile'} size={18} className="mx-auto" />
                  <span className="mt-1 block text-[10px]">{value}/5</span>
                </button>
              ))}
            </div>
          </div>

          <TagPicker label="Context" values={QUICK_TAGS} selected={tags} onToggle={(value) => toggle(value, tags, setTags)} />
          <TagPicker label="What helped" values={HELP_TAGS} selected={helped} onToggle={(value) => toggle(value, helped, setHelped)} />

          <div className="mt-6 flex gap-3">
            <button onClick={resetEditor} className="btn-secondary flex-1">Cancel</button>
            <button onClick={saveEntry} disabled={!text.trim()} className="btn-primary flex-1">
              <Icon name="Check" size={16} /> Save privately
            </button>
          </div>
        </section>
      )}

      {entries.length > 0 && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-silver bg-white px-4 py-3 shadow-soft">
          <Icon name="BookOpen" size={17} className="text-olive-primary" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your entries"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-silver-dark"
          />
          {search && <button onClick={() => setSearch('')} className="text-ink-soft"><Icon name="X" size={16} /></button>}
        </div>
      )}

      {entries.length === 0 && !editorOpen ? (
        <EmptyState
          icon="NotebookPen"
          title="Your journal is empty"
          description="Write a short private note about today. It can later add context to your timeline and weekly reflections."
          action={<button onClick={() => setEditorOpen(true)} className="btn-primary">Write your first entry</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon="BookOpen" title="No matching entries" description="Try another word or clear your search." />
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <article key={entry.id} className="premium-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-olive-primary">{formatLongDate(entry.date)}</p>
                  {entry.mood && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-olive-tint px-2.5 py-1 text-xs text-olive-deep">
                      <Icon name={entry.mood <= 2 ? 'Frown' : entry.mood === 3 ? 'Meh' : 'Smile'} size={13} /> Mood {entry.mood}/5
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(entry)} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Pencil" size={16} /></button>
                  <button onClick={() => remove(entry.id)} className="rounded-xl p-2 text-ink-soft hover:bg-silver-light"><Icon name="Trash2" size={16} /></button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink">{entry.text}</p>
              {(entry.contextTags.length > 0 || entry.whatHelped.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-silver/50 pt-4">
                  {entry.contextTags.map((tag) => <span key={`c-${tag}`} className="chip">{tag}</span>)}
                  {entry.whatHelped.map((tag) => <span key={`h-${tag}`} className="chip border-olive-soft/40 bg-olive-tint/50 text-olive-deep">Helped: {tag}</span>)}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TagPicker({ label, values, selected, onToggle }: { label: string; values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              selected.includes(value) ? 'border-olive-soft bg-olive-tint text-olive-deep' : 'border-silver bg-white text-ink-soft'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
