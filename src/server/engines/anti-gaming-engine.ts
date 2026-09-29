import { AttemptEvidence } from '../../types.ts';

export interface AntiGamingResult {
  evidenceWeight: number; // 0.1 to 1.0
  gamingPenalty: number;  // 0 to 100
  gamingSignals: string[];
  explanation: string;
}

/**
 * Anti-Gaming Engine
 * Protects against:
 * 1. Rapid guessing (< 3000ms on non-trivial questions)
 * 2. Repeated rapid retries / answer cycling (fail-fail-fail-correct within seconds)
 * 3. Low-confidence lucky guesses
 * 4. Heavy hint dependence (2+ hints used)
 * 5. Spamming identical questions
 */
export function analyzeGamingBehavior(params: {
  currentAttempt: Partial<AttemptEvidence>;
  recentAttempts: AttemptEvidence[];
}): AntiGamingResult {
  const { currentAttempt, recentAttempts = [] } = params;
  const signals: string[] = [];
  let weight = 1.0;
  let penalty = 0;

  const responseTimeMs = currentAttempt.responseTimeMs || 15000;
  const difficulty = currentAttempt.difficulty || 'Medium';
  const confidence = currentAttempt.confidence ?? 'Medium';
  const hintsUsed = currentAttempt.hintsUsed || 0;
  const isCorrect = Boolean(currentAttempt.correct);
  const questionId = currentAttempt.questionId;

  // 1. Rapid Guessing Detection
  const minExpectedTime = difficulty === 'Hard' ? 6000 : difficulty === 'Medium' ? 3500 : 1800;
  if (responseTimeMs < minExpectedTime) {
    signals.push(`Rapid answer submitted in ${(responseTimeMs / 1000).toFixed(1)}s (expected ≥ ${(minExpectedTime / 1000).toFixed(1)}s)`);
    weight *= isCorrect ? 0.45 : 0.6;
    penalty += 35;
  }

  // 2. Answer Cycling / Rapid Retries on same question or concept
  const sameQuestionHistory = recentAttempts.filter((a) => a.questionId === questionId);
  if (sameQuestionHistory.length >= 2) {
    const lastAttempt = sameQuestionHistory[sameQuestionHistory.length - 1];
    const timeDelta = Date.now() - new Date(lastAttempt.timestamp).getTime();
    if (timeDelta < 30000 && !lastAttempt.correct && isCorrect) {
      signals.push('Rapid retry success immediately following recent error (answer elimination pattern detected)');
      weight *= 0.4;
      penalty += 40;
    } else if (sameQuestionHistory.length >= 3) {
      signals.push(`Repeated attempt (${sameQuestionHistory.length + 1}th attempt on question)`);
      weight *= 0.5;
      penalty += 25;
    }
  }

  // 3. Hint Dependency
  if (hintsUsed > 0) {
    const hintPenalty = Math.min(0.5, hintsUsed * 0.25);
    signals.push(`Assisted response with ${hintsUsed} hint(s) utilized`);
    weight *= 1 - hintPenalty;
    penalty += hintsUsed * 15;
  }

  // 4. Low-Confidence Guessing Penalty on Correct Answer
  const isLowConfidence = confidence === 'Low' || (typeof confidence === 'number' && confidence < 40);
  if (isCorrect && isLowConfidence) {
    signals.push('Correct response reported with Low learner confidence (probable lucky guess)');
    weight *= 0.55;
    penalty += 20;
  }

  // 5. Short Burst Guessing Streak (3+ quick wrong attempts in under 60 seconds)
  const recent60s = recentAttempts.filter((a) => Date.now() - new Date(a.timestamp).getTime() < 60000);
  if (recent60s.length >= 3 && recent60s.some((a) => !a.correct)) {
    signals.push('High attempt burst rate (>3 attempts within 60s)');
    weight *= 0.6;
    penalty += 30;
  }

  // Bound weight and penalty
  const finalWeight = Math.max(0.1, Math.min(1.0, Math.round(weight * 100) / 100));
  const finalPenalty = Math.min(100, Math.round(penalty));

  let explanation = 'Independent, authentic response evidence verified.';
  if (signals.length > 0) {
    explanation = `Evidence weight calibrated to ${(finalWeight * 100).toFixed(0)}%: ${signals.join('. ')}.`;
  }

  return {
    evidenceWeight: finalWeight,
    gamingPenalty: finalPenalty,
    gamingSignals: signals,
    explanation,
  };
}
