import type { Answers, Question, AnswerRecord } from '../types';
import { CORE_QUESTIONS, FOLLOW_UP_QUESTIONS } from './questions';

/**
 * Build the adaptive question sequence for the current check-in.
 * Core questions are always asked in order. Follow-up questions are appended
 * only if their trigger condition is satisfied by an already-given answer.
 *
 * Because follow-ups can only be evaluated once their trigger question is
 * answered, this function is called repeatedly as answers accumulate. It
 * returns the full ordered list of questions that should currently appear,
 * ending at the next unanswered question.
 */
export function buildQuestionSequence(answers: Answers): Question[] {
  const sequence: Question[] = [...CORE_QUESTIONS];

  const coreAnswered = CORE_QUESTIONS.every((q) => answers[q.id]);

  if (coreAnswered) {
    for (const q of FOLLOW_UP_QUESTIONS) {
      if (shouldAsk(q, answers)) {
        sequence.push(q);
      }
    }
  }

  return sequence;
}

export function shouldAsk(question: Question, answers: Answers): boolean {
  if (question.core) return true;
  if (!question.followUp) return false;

  const trigger = answers[question.followUp.triggerQuestionId];
  if (!trigger) return false;

  const cond = question.followUp;
  if (cond.maxScore !== undefined && trigger.score > cond.maxScore) return false;
  if (cond.minScore !== undefined && trigger.score < cond.minScore) return false;
  if (cond.optionIds && !cond.optionIds.includes(trigger.optionId)) return false;
  return true;
}

/** First question in the sequence that hasn't been answered yet, or null if done. */
export function nextUnanswered(answers: Answers): Question | null {
  const sequence = buildQuestionSequence(answers);
  return sequence.find((q) => !answers[q.id]) ?? null;
}

export function totalAnswered(answers: Answers): number {
  return Object.keys(answers).length;
}

export function recordAnswer(question: Question, optionId: string): AnswerRecord {
  const option = question.options.find((o) => o.id === optionId)!;
  return {
    questionId: question.id,
    optionId,
    score: option.score,
    label: option.label,
    category: question.category,
    value: option.value,
    answeredAt: new Date().toISOString(),
  };
}

export function estimateRemaining(answers: Answers): { answered: number; total: number } {
  const sequence = buildQuestionSequence(answers);
  const total = sequence.length;
  const answered = sequence.filter((q) => answers[q.id]).length;
  return { answered, total };
}
