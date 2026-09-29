import { db } from '../db/store.ts';
import { AttemptEvidence, LearningTwin, LearningTwinConcept } from '../../types.ts';
import { evaluatePrerequisiteReadiness } from './prerequisite-engine.ts';

export interface MasteryUpdateResult {
  conceptState: LearningTwinConcept;
  overallTwin: LearningTwin;
  deltaMastery: number;
  uncertainty: 'Low' | 'Medium' | 'High';
  transferScore: number;
  explanation: string;
}

/**
 * Mastery Engine
 * Deterministic multi-factor Bayesian-grounded cognitive state updating.
 * Never uses naive (correct / total) or fixed +10/-10 bumps.
 */
export function updateConceptMasteryFromEvidence(params: {
  studentId: string;
  conceptId: string;
  latestEvidence?: AttemptEvidence;
}): MasteryUpdateResult {
  const { studentId, conceptId, latestEvidence } = params;
  const state = db.getState();

  // Retrieve all student evidence for this concept
  const allStudentEvidences = (state.attemptEvidences || []).filter((e) => e.studentId === studentId);
  const conceptEvidences = allStudentEvidences.filter((e) => e.conceptId === conceptId);

  // Retrieve or initialize concept state
  let tc = state.learningTwinConcepts.find((item) => item.studentId === studentId && item.conceptId === conceptId);
  if (!tc) {
    tc = {
      id: `ltc_${studentId}_${conceptId}`,
      studentId,
      conceptId,
      masteryScore: 0,
      uncertainty: 'High',
      confidenceLevel: 50,
      attemptsCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      recentAccuracy: 0,
      weightedAccuracy: 0,
      avgResponseTimeMs: 12000,
      hintsUsed: 0,
      retryCount: 0,
      independentEvidenceCount: 0,
      forgettingRisk: 'Low',
      transferScore: 0,
      status: 'Not Learned',
    };
    state.learningTwinConcepts.push(tc);
  }

  const previousMastery = tc.masteryScore;

  if (conceptEvidences.length === 0) {
    const twin = updateTwinMastery(studentId);
    return {
      conceptState: tc,
      overallTwin: twin,
      deltaMastery: 0,
      uncertainty: 'High',
      transferScore: 0,
      explanation: 'No evidence collected yet for this concept.',
    };
  }

  // 1. Compute Base Evidence Aggregation with Recency Decay & Anti-Gaming Weights
  let weightedCorrectSum = 0;
  let totalEvidenceWeight = 0;
  let totalResponseTime = 0;
  let hintsCount = 0;
  let retryCount = 0;
  let independentCount = 0;
  let correctCount = 0;
  let incorrectCount = 0;

  // Transfer questions tracking
  const transferEvidences = conceptEvidences.filter((e) => e.isTransferQuestion);
  let transferCorrect = 0;

  conceptEvidences.forEach((ev, idx) => {
    // Recency weighting: more recent attempts have higher weight
    const recencyFactor = Math.pow(1.15, idx); // latest index has highest recency
    const diffMultiplier = ev.difficulty === 'Hard' ? 1.3 : ev.difficulty === 'Medium' ? 1.0 : 0.8;
    const baseWeight = (ev.evidenceWeight ?? 1.0) * diffMultiplier * recencyFactor;

    if (ev.correct) {
      correctCount += 1;
      weightedCorrectSum += 100 * baseWeight;
    } else {
      incorrectCount += 1;
      weightedCorrectSum += 0 * baseWeight;
    }

    totalEvidenceWeight += baseWeight;
    totalResponseTime += ev.responseTimeMs || 12000;
    hintsCount += ev.hintsUsed || 0;
    if (ev.isRetry) retryCount += 1;
    if (ev.hintsUsed === 0 && (ev.evidenceWeight ?? 1.0) >= 0.8) {
      independentCount += 1;
    }

    if (ev.isTransferQuestion && ev.correct) {
      transferCorrect += 1;
    }
  });

  const totalAttempts = conceptEvidences.length;
  const rawWeightedAccuracy = totalEvidenceWeight > 0 ? Math.round(weightedCorrectSum / totalEvidenceWeight) : 50;

  // 2. Recent Accuracy (last 3 attempts)
  const last3 = conceptEvidences.slice(-3);
  const recentCorrect = last3.filter((e) => e.correct).length;
  const recentAccuracy = Math.round((recentCorrect / Math.max(1, last3.length)) * 100);

  // 3. Transfer Score (0 - 100)
  let transferScore = 50; // baseline if no transfer questions taken
  if (transferEvidences.length > 0) {
    transferScore = Math.round((transferCorrect / transferEvidences.length) * 100);
  }

  // 4. Uncertainty Calculation
  // Uncertainty is high when:
  // - Few attempts (<= 2)
  // - Low independent evidence
  // - High variance
  // - Transfer failure despite high easy accuracy
  let uncertaintyScore = 100;
  if (independentCount >= 5) {
    uncertaintyScore = 20; // Low
  } else if (independentCount >= 3) {
    uncertaintyScore = 50; // Medium
  } else if (independentCount === 2) {
    uncertaintyScore = 65; // Medium
  } else {
    uncertaintyScore = 85; // High
  }

  // If transfer score is poor (< 50%) but basic accuracy is high, boost uncertainty
  if (transferEvidences.length > 0 && transferScore < 50 && rawWeightedAccuracy > 60) {
    uncertaintyScore = Math.min(100, uncertaintyScore + 30);
  }

  const uncertaintyLevel: 'Low' | 'Medium' | 'High' =
    uncertaintyScore <= 30 ? 'Low' : uncertaintyScore <= 65 ? 'Medium' : 'High';

  // 5. Prerequisite Readiness Adjustment
  const prereqEval = evaluatePrerequisiteReadiness({ studentId, conceptId });
  let prereqMultiplier = 1.0;
  if (!prereqEval.isReady) {
    // If prerequisites are weak (< 70%), cap and damp mastery
    const maxAllowed = Math.max(45, prereqEval.readinessScore);
    prereqMultiplier = Math.min(1.0, maxAllowed / 100);
  }

  // 6. Compute Final Deterministic Mastery Score
  let computedMastery = Math.round(
    (rawWeightedAccuracy * 0.65 + recentAccuracy * 0.35) * prereqMultiplier
  );

  // If transfer questions failed, penalize full mastery ceiling
  if (transferEvidences.length > 0 && transferScore < 50) {
    computedMastery = Math.min(68, computedMastery);
  }

  // Boundary clamp
  computedMastery = Math.max(0, Math.min(100, computedMastery));

  // 7. Update Concept State
  tc.attemptsCount = totalAttempts;
  tc.correctCount = correctCount;
  tc.incorrectCount = incorrectCount;
  tc.recentAccuracy = recentAccuracy;
  tc.weightedAccuracy = rawWeightedAccuracy;
  tc.avgResponseTimeMs = Math.round(totalResponseTime / totalAttempts);
  tc.hintsUsed = hintsCount;
  tc.retryCount = retryCount;
  tc.independentEvidenceCount = independentCount;
  tc.transferScore = transferScore;
  tc.uncertainty = uncertaintyLevel;
  tc.masteryScore = computedMastery;
  tc.lastAssessedAt = new Date().toISOString();
  tc.lastPracticedAt = new Date().toISOString();

  if (latestEvidence && latestEvidence.correct && (latestEvidence.evidenceWeight ?? 1) >= 0.8) {
    tc.lastStrongEvidenceAt = new Date().toISOString();
  }

  // Set categorical status
  if (tc.masteryScore >= 75 && tc.uncertainty !== 'High' && prereqEval.isReady) {
    tc.status = 'Mastered';
  } else if (tc.masteryScore < 50 || !prereqEval.isReady) {
    tc.status = 'Gap';
  } else {
    tc.status = 'Learning';
  }

  // Update learner confidence level
  const avgConf =
    conceptEvidences.reduce((acc, e) => {
      const val = e.confidence === 'High' ? 90 : e.confidence === 'Medium' ? 60 : 30;
      return acc + val;
    }, 0) / totalAttempts;
  tc.confidenceLevel = Math.round(avgConf);

  const deltaMastery = computedMastery - previousMastery;
  const overallTwin = updateTwinMastery(studentId);
  db.save();

  let explanation = `Mastery updated to ${computedMastery}% (${deltaMastery >= 0 ? '+' : ''}${deltaMastery}%) with ${uncertaintyLevel} uncertainty.`;
  if (!prereqEval.isReady) {
    explanation += ` Prerequisite constraint applied due to deficit in ${prereqEval.deficientPrerequisites.map((d) => d.conceptName).join(', ')}.`;
  }
  if (transferEvidences.length > 0 && transferScore < 50) {
    explanation += ` Transfer question failure capped maximum mastery advancement.`;
  }

  return {
    conceptState: tc,
    overallTwin,
    deltaMastery,
    uncertainty: uncertaintyLevel,
    transferScore,
    explanation,
  };
}

/**
 * Aggregates all concept states into student overall Learning Twin
 */
export function updateTwinMastery(studentId: string): LearningTwin {
  const state = db.getState();
  const twinConcepts = state.learningTwinConcepts.filter((c) => c.studentId === studentId);
  const subjects = state.subjects;

  const subjectScores: Record<string, { total: number; count: number }> = {};
  for (const tc of twinConcepts) {
    const concept = state.concepts.find((c) => c.id === tc.conceptId);
    if (!concept) continue;
    if (!subjectScores[concept.subjectId]) {
      subjectScores[concept.subjectId] = { total: 0, count: 0 };
    }
    subjectScores[concept.subjectId].total += tc.masteryScore;
    subjectScores[concept.subjectId].count += 1;
  }

  const subjectMastery: Record<string, number> = {};
  let totalSum = 0;
  let totalCount = 0;

  for (const sub of subjects) {
    const data = subjectScores[sub.id];
    if (data && data.count > 0) {
      const avg = Math.round(data.total / data.count);
      subjectMastery[sub.id] = avg;
      totalSum += avg;
      totalCount += 1;
    } else {
      subjectMastery[sub.id] = 50;
      totalSum += 50;
      totalCount += 1;
    }
  }

  const overallMastery = totalCount > 0 ? Math.round(totalSum / totalCount) : 50;
  const masteredCount = twinConcepts.filter((c) => c.masteryScore >= 75 && c.status === 'Mastered').length;
  const activeGaps = state.knowledgeGaps.filter((g) => g.studentId === studentId && g.status !== 'RESOLVED').length;

  let twin = state.learningTwins.find((t) => t.studentId === studentId);
  if (!twin) {
    twin = {
      id: `twin_${studentId}`,
      studentId,
      overallMastery,
      learningMomentum: 12,
      retentionHealth: 80,
      activeGapsCount: activeGaps,
      conceptsMasteredCount: masteredCount,
      totalStudyHours: 28,
      assessmentsCompletedCount: (state.assessmentAttempts || []).filter((a) => a.studentId === studentId).length || 8,
      avgAssessmentScore: 76,
      subjectMastery,
      updatedAt: new Date().toISOString(),
    };
    state.learningTwins.push(twin);
  } else {
    twin.overallMastery = overallMastery;
    twin.conceptsMasteredCount = masteredCount;
    twin.activeGapsCount = activeGaps;
    twin.subjectMastery = subjectMastery;
    twin.updatedAt = new Date().toISOString();
  }

  db.save();
  return twin;
}

// Backward-compatible calculateMastery helper for pure unit calculations
export function calculateMastery(params: {
  assessmentAccuracy: number;
  questionDifficultyWeight: number;
  attemptsCount: number;
  recentScore: number;
  previousMastery?: number;
}): number {
  const { assessmentAccuracy, questionDifficultyWeight, attemptsCount, recentScore, previousMastery = 50 } = params;
  const weightedPerformance = assessmentAccuracy * questionDifficultyWeight;
  const recentWeight = 0.6;
  const historicWeight = 0.4;
  let computed = (recentScore * recentWeight) + (previousMastery * historicWeight);
  computed = computed * (0.8 + (questionDifficultyWeight * 0.2));
  const consistency = Math.min(attemptsCount * 2, 10);
  computed += consistency;
  return Math.min(100, Math.max(0, Math.round(computed)));
}
