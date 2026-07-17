import { useState } from 'react';
import { Icon } from './Icon';
import { Modal } from './Modal';
import type { Mission, Contributor } from '../types';
import { difficultyLabel } from '../utils/format';
import { replacementMission } from '../engine/recommendations';

interface MissionCardProps {
  mission: Mission;
  onToggle: () => void;
  onReplace: (replacement: Mission) => void;
  onEdit: (name: string) => void;
  contributors: Contributor[];
}

const DIFFICULTY_STYLES: Record<Mission['difficulty'], string> = {
  gentle: 'bg-olive-tint text-olive-deep',
  moderate: 'bg-silver-light text-olive-deep',
  focused: 'bg-silver-dark/20 text-ink',
};

export function MissionCard({ mission, onToggle, onReplace, onEdit, contributors }: MissionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(mission.name);
  const [replaceOpen, setReplaceOpen] = useState(false);

  const closeAll = () => {
    setMenuOpen(false);
    setReplaceOpen(false);
  };

  const doEdit = () => {
    if (editValue.trim()) onEdit(editValue.trim());
    setEditing(false);
    setMenuOpen(false);
  };

  const doReplace = () => {
    const next = replacementMission([mission], contributors);
    onReplace(next);
    closeAll();
  };

  return (
    <>
      <div
        className={`rounded-2xl border p-4 transition-all duration-300 ${
          mission.completed
            ? 'border-olive-soft/40 bg-olive-tint/40'
            : 'border-silver bg-white hover:border-olive-soft/50 hover:shadow-soft'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={mission.completed}
            aria-label={mission.completed ? 'Mark as not completed' : 'Mark as completed'}
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
              mission.completed
                ? 'border-olive-primary bg-olive-primary text-white'
                : 'border-silver bg-white text-transparent hover:border-olive-soft'
            }`}
          >
            <Icon name="Check" size={15} strokeWidth={3} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              {editing ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doEdit()}
                    className="min-w-0 flex-1 rounded-lg border border-silver bg-white px-2.5 py-1.5 text-sm text-ink focus:border-olive-primary focus:outline-none"
                  />
                  <button onClick={doEdit} className="rounded-lg bg-olive-primary px-3 py-1.5 text-xs font-semibold text-white">
                    Save
                  </button>
                </div>
              ) : (
                <p
                  className={`text-[15px] font-semibold ${
                    mission.completed ? 'text-ink-soft line-through' : 'text-ink'
                  }`}
                >
                  {mission.name}
                </p>
              )}

              {!editing && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Mission options"
                    aria-expanded={menuOpen}
                    className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-silver-light hover:text-ink"
                  >
                    <Icon name="MoreHorizontal" size={18} />
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={closeAll} />
                      <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-silver bg-white py-1 shadow-soft-lg">
                        <button
                          onClick={() => {
                            setEditing(true);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink hover:bg-silver-light/60"
                        >
                          <Icon name="Pencil" size={15} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setReplaceOpen(true);
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink hover:bg-silver-light/60"
                        >
                          <Icon name="RefreshCw" size={15} /> Replace
                        </button>
                        <button
                          onClick={() => {
                            window.alert('Reminder set — you would be nudged at your preferred time.');
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink hover:bg-silver-light/60"
                        >
                          <Icon name="Bell" size={15} /> Set reminder
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{mission.reason}</p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className={`chip ${DIFFICULTY_STYLES[mission.difficulty]} border-transparent`}>
                <Icon name="Scale" size={12} />
                {difficultyLabel(mission.difficulty)}
              </span>
              <span className="chip border-transparent bg-silver-light text-ink-soft">
                <Icon name="Clock" size={12} />
                {mission.estimatedMinutes} min
              </span>
              {mission.completed && (
                <span className="chip border-olive-soft/40 bg-olive-tint text-olive-deep">
                  <Icon name="CheckCircle" size={12} />
                  Done
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={replaceOpen} onClose={closeAll} title="Replace this mission?" size="sm">
        <p className="mb-5 text-sm leading-relaxed text-ink-soft">
          We'll swap this for another gentle, relevant mission based on today's check-in.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <button onClick={doReplace} className="btn-primary w-full">
            Replace mission
          </button>
          <button onClick={closeAll} className="btn-secondary w-full">
            Keep this one
          </button>
        </div>
      </Modal>
    </>
  );
}
