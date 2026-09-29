import { db } from '../db/store.ts';
import { AttemptEvidence, Question } from '../../types.ts';
import { analyzeGamingBehavior } from './anti-gaming-engine.ts';

export interface RecordAttemptInput {
  studentId: string;
  conceptId: string;
  questionId: string;
  selectedOption: string;
  confidence?: 'Low' | 'Medium' | 'High' | number;
  responseTimeMs?: number;
  hintsUsed?: number;
  sessionId?: string;
  isRetry?: boolean;
  questionType?: 'DIAGNOSTIC' | 'PRACTICE' | 'TRANSFER' | 'CHALLENGE' | 'REVISION';
  isTransferQuestion?: boolean;
}

export interface RecordAttemptResult {
  evidence: AttemptEvidence;
  question: Question;
  isCorrect: boolean;
  antiGaming: {
    evidenceWeight: number;
    gamingPenalty: number;
    gamingSignals: string[];
    explanation: string;
  };
}

/**
 * Evidence Engine
 * Ingests, normalizes, validates, and persists AttemptEvidence.
 */
export function recordAttemptEvidence(input: RecordAttemptInput): RecordAttemptResult {
  const state = db.getState();

  // Find question
  let question = state.questions.find((q) => q.id === input.questionId);
  if (!question) {
    // If not found in primary list, generate/fallback
    question = {
      id: input.questionId,
      conceptId: input.conceptId,
      difficulty: 'Medium',
      question: 'Concept Verification Item',
      options: ['Correct', 'Wrong', 'Option C', 'Option D'],
      correctAnswer: 'Correct',
      explanation: 'Verified via cognitive model assessment.',
    };
  }

  const norm = (s: any) => String(s || '').trim().toLowerCase();
  const isCorrect = norm(input.selectedOption) === norm(question.correctAnswer);

  const isTransferQuestion = Boolean(input.isTransferQuestion ?? question.isTransferQuestion);
  const questionType = input.questionType || (isTransferQuestion ? 'TRANSFER' : 'PRACTICE');

  // Fetch recent attempts by this student for anti-gaming context
  const studentAttempts = (state.attemptEvidences || []).filter((a) => a.studentId === input.studentId);
  const recentAttempts = studentAttempts.slice(-10);

  const antiGaming = analyzeGamingBehavior({
    currentAttempt: {
      studentId: input.studentId,
      conceptId: input.conceptId,
      questionId: input.questionId,
      correct: isCorrect,
      difficulty: question.difficulty,
      responseTimeMs: input.responseTimeMs,
      confidence: input.confidence ?? 'Medium',
      hintsUsed: input.hintsUsed ?? 0,
      isRetry: input.isRetry ?? false,
    },
    recentAttempts,
  });

  const conceptAttempts = studentAttempts.filter((a) => a.conceptId === input.conceptId);
  const attemptNumber = conceptAttempts.length + 1;

  const evidence: AttemptEvidence = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId: input.studentId,
    conceptId: input.conceptId,
    questionId: input.questionId,
    selectedOption: input.selectedOption,
    correctAnswer: question.correctAnswer,
    correct: isCorrect,
    difficulty: question.difficulty,
    responseTimeMs: Math.max(100, input.responseTimeMs || 12000),
    confidence: input.confidence ?? 'Medium',
    hintsUsed: input.hintsUsed || 0,
    attemptNumber,
    sessionId: input.sessionId || `sess_${Date.now()}`,
    timestamp: new Date().toISOString(),
    isRetry: Boolean(input.isRetry || (conceptAttempts.length > 0 && conceptAttempts.some((a) => a.questionId === input.questionId))),
    questionType,
    isTransferQuestion,
    evidenceWeight: antiGaming.evidenceWeight,
    gamingSignals: antiGaming.gamingSignals,
  };

  if (!state.attemptEvidences) {
    state.attemptEvidences = [];
  }
  state.attemptEvidences.push(evidence);
  db.save();

  return {
    evidence,
    question,
    isCorrect,
    antiGaming,
  };
}

export function getStudentEvidence(studentId: string, conceptId?: string): AttemptEvidence[] {
  const state = db.getState();
  const evidences = state.attemptEvidences || [];
  if (conceptId) {
    return evidences.filter((e) => e.studentId === studentId && e.conceptId === conceptId);
  }
  return evidences.filter((e) => e.studentId === studentId);
}
