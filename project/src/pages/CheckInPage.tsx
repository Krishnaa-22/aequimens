import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Answers } from '../types';
import { buildQuestionSequence, recordAnswer, estimateRemaining } from '../engine/branching';
import { CORE_QUESTIONS, FOLLOW_UP_INTRO } from '../engine/questions';
import { runCheckIn, toDaySummary } from '../engine/scoring';
import { storage } from '../data/localStorage';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/Feedback';
import { Icon } from '../components/Icon';
import { useCheckIns, useTodaysMissions, useHistory, useStreak } from '../hooks';
import { todayISO } from '../utils/format';

export function CheckInPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answers>({});
  const { save: saveCheckIn } = useCheckIns();
  const { saveSet } = useTodaysMissions(todayISO());
  const { upsert } = useHistory();
  const { streak, set: setStreak } = useStreak();

  const sequence = useMemo(() => buildQuestionSequence(answers), [answers]);
  const currentIndex = sequence.findIndex((q) => !answers[q.id]);
  const activeIndex = currentIndex === -1 ? sequence.length - 1 : currentIndex;
  const question = sequence[activeIndex];
  const { answered, total } = estimateRemaining(answers);

  const coreAnswered = CORE_QUESTIONS.every((q) => answers[q.id]);
  const showingFollowUps = coreAnswered && !CORE_QUESTIONS.includes(question);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (!question) return;
      const record = recordAnswer(question, optionId);
      setAnswers((prev) => ({ ...prev, [question.id]: record }));
    },
    [question],
  );

  const finish = useCallback(() => {
    const result = runCheckIn(answers);
    saveCheckIn(result);
    saveSet({ date: result.date, missions: result.missions });
    upsert(toDaySummary(result));

    // streak logic: increment if last check-in was a different day, else keep
    const lastCheckInDate = storage.getCheckIns()[1]?.date; // [0] is the one we just saved
    if (!lastCheckInDate || lastCheckInDate !== todayISO()) {
      setStreak(streak + 1);
    }
    import('../engine/insights').then(({ evaluateAchievements }) => {
      storage.saveAchievements(evaluateAchievements(storage.getHistory()));
    });

    navigate('/processing');
  }, [answers, saveCheckIn, saveSet, upsert, streak, setStreak, navigate]);

  const handleContinue = useCallback(() => {
    if (!question) {
      finish();
      return;
    }
    if (!answers[question.id]) return;
    // advance to next unanswered; if none, finish
    const next = sequence.findIndex((q, i) => i > activeIndex && !answers[q.id]);
    if (next === -1) {
      finish();
    }
    // otherwise the component re-renders with the new activeIndex automatically
  }, [question, answers, sequence, activeIndex, finish]);

  const handleBack = useCallback(() => {
    if (activeIndex === 0) {
      navigate(-1);
      return;
    }
    const prev = sequence[activeIndex - 1];
    if (prev) {
      setAnswers((prevAnswers) => {
        const copy = { ...prevAnswers };
        delete copy[prev.id];
        return copy;
      });
    }
  }, [activeIndex, sequence, navigate]);

  if (!question) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-ink-soft">Preparing your snapshot…</p>
        <button onClick={finish} className="btn-primary mt-4">
          Continue
        </button>
      </div>
    );
  }

  const isLast = activeIndex === sequence.length - 1 || sequence.slice(activeIndex + 1).every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-xl px-5 py-8 md:px-6 md:py-12">
      <div className="mb-6">
        <ProgressBar value={answered / Math.max(1, total)} showCount current={answered} total={total} label="Daily check-in" />
      </div>

      {showingFollowUps && activeIndex === CORE_QUESTIONS.length && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-olive-soft/40 bg-olive-tint/50 p-3.5 text-sm text-olive-deep animate-fadeIn">
          <Icon name="Sparkles" size={18} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">{FOLLOW_UP_INTRO}</p>
        </div>
      )}

      <QuestionCard
        key={question.id}
        question={question}
        answers={answers}
        onSelect={handleSelect}
        onBack={handleBack}
        canContinue={!!answers[question.id]}
        onContinue={handleContinue}
        isLast={isLast}
      />
    </div>
  );
}
