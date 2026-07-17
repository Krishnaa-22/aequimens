import type { Question, Answers } from '../types';
import { AnswerOption } from './AnswerOption';
import { Icon } from './Icon';

interface QuestionCardProps {
  question: Question;
  answers: Answers;
  onSelect: (optionId: string) => void;
  onBack: () => void;
  canContinue: boolean;
  onContinue: () => void;
  isLast: boolean;
}

export function QuestionCard({
  question,
  answers,
  onSelect,
  onBack,
  canContinue,
  onContinue,
  isLast,
}: QuestionCardProps) {
  const selected = answers[question.id];

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col">
      <div className="flex-1">
        <div key={question.id} className="animate-slideInRight">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive-primary">
            {question.help ?? ''}
          </p>
          <h1 className="text-balance text-2xl font-bold leading-snug text-ink md:text-3xl">
            {question.text}
          </h1>
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          {question.options.map((option, i) => (
            <AnswerOption
              key={option.id}
              option={option}
              question={question}
              selected={selected?.optionId === option.id}
              onSelect={onSelect}
              index={i}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-silver-light/60 hover:text-ink"
        >
          <Icon name="ArrowLeft" size={18} />
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className="btn-primary flex-1"
        >
          {isLast ? 'See my wellness snapshot' : 'Continue'}
          <Icon name="ArrowRight" size={18} />
        </button>
      </div>
    </div>
  );
}
