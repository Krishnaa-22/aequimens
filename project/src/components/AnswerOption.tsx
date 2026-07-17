import { Icon } from './Icon';
import type { AnswerOption as AnswerOptionType, Question } from '../types';

interface AnswerOptionProps {
  option: AnswerOptionType;
  question: Question;
  selected: boolean;
  onSelect: (optionId: string) => void;
  index: number;
}

export function AnswerOption({ option, question, selected, onSelect, index }: AnswerOptionProps) {
  // For stress, higher score = worse, but visual order already labels from calm->overwhelming.
  const isStress = question.category === 'stress';

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-300 animate-fadeIn ${
        selected
          ? 'border-olive-soft bg-olive-tint/70 shadow-glow'
          : 'border-silver bg-white hover:border-olive-soft/60 hover:bg-silver-light/40'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
          selected
            ? 'bg-olive-shine text-white shadow-soft'
            : 'bg-silver-light text-olive-deep group-hover:bg-olive-tint'
        }`}
      >
        <Icon name={option.icon} size={20} />
      </span>
      <span className="flex flex-1 flex-col">
        <span className={`text-[15px] font-semibold ${selected ? 'text-olive-deep' : 'text-ink'}`}>
          {option.label}
        </span>
        <span className="mt-0.5 text-xs text-ink-soft">
          {isStress ? `Level ${option.score}` : `${option.score} / 5`}
        </span>
      </span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          selected ? 'border-olive-primary bg-olive-primary text-white' : 'border-silver bg-white'
        }`}
        aria-hidden="true"
      >
        {selected && <Icon name="Check" size={14} strokeWidth={3} />}
      </span>
    </button>
  );
}
