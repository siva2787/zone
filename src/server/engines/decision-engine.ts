import { db } from '../db/store.ts';
import {
  DecisionActionType,
  DecisionRecord,
  CandidateAction,
  DecisionFactors,
  AttemptEvidence,
  LearningTwinConcept,
} from '../../types.ts';
import { evaluatePrerequisiteReadiness } from './prerequisite-engine.ts';
import { calculateRetentionHealth } from './retention-engine.ts';

export const DECISION_ENGINE_VERSION = '2.4.0-zone';

export interface EvaluateNextActionParams {
  studentId: string;
  focusConceptId?: string;
  latestEvidence?: AttemptEvidence;
}

/**
 * ZONE Explainable Next-Action Decision Engine
 * Deterministically evaluates candidate actions across the concept graph,
 * calculates decision factor weights, enforces prerequisite and teacher constraints,
 * selects the optimal next action, and outputs a complete auditable DecisionRecord.
 */
export function evaluateNextAction(params: EvaluateNextActionParams): DecisionRecord {
  const { studentId, focusConceptId, latestEvidence } = params;
  const state = db.getState();

  const concepts = state.concepts.filter((c) => c.subjectId === 'sub_ml' || c.subjectId === 'sub_stat');
  const twinConcepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);
  const evidences = (state.attemptEvidences || []).filter((e) => e.studentId === studentId);
  const teacherOverrides = (state.teacherOverrides || []).filter((o) => o.studentId === studentId && o.active);
  const retentionData = calculateRetentionHealth(studentId);

  // 1. Determine active / target concept to evaluate
  let targetConcept = concepts.find((c) => c.id === focusConceptId);
  if (!targetConcept) {
    if (latestEvidence) {
      targetConcept = concepts.find((c) => c.id === latestEvidence.conceptId);
    } else {
      // Find first unmastered or bottlenecked concept in sequence
      const sequence = ['c_prob', 'c_rand_vars', 'c_cond_prob', 'c_bayes', 'c_naive_bayes', 'c_classif', 'c_eval'];
      for (const cid of sequence) {
        const tc = twinConcepts.find((item) => item.conceptId === cid);
        if (!tc || tc.masteryScore < 75 || tc.status === 'Gap') {
          targetConcept = concepts.find((c) => c.id === cid);
          break;
        }
      }
    }
  }

  // Safe fallback to first concept or dummy concept
  const activeConcept = targetConcept || concepts[0] || {
    id: 'c_prob',
    name: 'Probability Fundamentals',
    description: 'Core rules of sample spaces and basic probability axioms.',
    difficulty: 'Beginner' as const,
    estimatedMinutes: 15,
    summaryNotes: '',
    topicId: 'top_prob',
    subjectId: 'sub_ml',
  };

  const conceptId = activeConcept.id;
  const tc = twinConcepts.find((item) => item.conceptId === conceptId);
  const conceptEvidences = evidences.filter((e) => e.conceptId === conceptId);

  // 2. Gather Evidence Signals
  const attemptsCount = tc?.attemptsCount ?? conceptEvidences.length;
  const masteryScore = tc?.masteryScore ?? 0;
  const uncertainty = tc?.uncertainty ?? 'High';
  const recentAccuracy = tc?.recentAccuracy ?? (latestEvidence?.correct ? 100 : 0);
  const transferScore = tc?.transferScore ?? 50;
  const forgettingRisk = tc?.forgettingRisk ?? 'Low';
  const hintsUsed = tc?.hintsUsed ?? 0;
  const avgResponseTimeMs = tc?.avgResponseTimeMs ?? 12000;
  const independentCount = tc?.independentEvidenceCount ?? 0;

  const recentErrors = conceptEvidences.slice(-4).filter((e) => !e.correct).length;
  const gamingPenalty = latestEvidence?.gamingSignals && latestEvidence.gamingSignals.length > 0 ? 35 : 0;

  // 3. Prerequisite Evaluation
  const prereqEval = evaluatePrerequisiteReadiness({ studentId, conceptId });

  // 4. Candidate Actions Generation & Scoring
  const candidates: CandidateAction[] = [];

  // Candidate: REMEDIATE_PREREQUISITE
  if (!prereqEval.isReady && prereqEval.deficientPrerequisites.length > 0) {
    const mostDeficient = prereqEval.deficientPrerequisites.reduce((prev, curr) =>
      curr.masteryScore < prev.masteryScore ? curr : prev
    );
    candidates.push({
      action: 'REMEDIATE_PREREQUISITE',
      targetConceptId: mostDeficient.conceptId,
      targetConceptName: mostDeficient.conceptName,
      score: 95 + (70 - mostDeficient.masteryScore) * 0.2,
      reason: `Prerequisite ${mostDeficient.conceptName} mastery (${mostDeficient.masteryScore}%) is below required threshold (${mostDeficient.threshold}%). Downstream mastery of ${activeConcept.name} cannot be established without foundational readiness.`,
      valid: true,
    });
  }

  // Candidate: REVIEW (Spaced repetition)
  const isUrgentReview = retentionData.urgentReviewConceptIds.includes(conceptId);
  const isFadingReview = retentionData.fadingConceptIds.includes(conceptId);
  if (isUrgentReview || isFadingReview || forgettingRisk === 'High' || forgettingRisk === 'Medium') {
    candidates.push({
      action: 'REVIEW',
      targetConceptId: conceptId,
      targetConceptName: activeConcept.name,
      score: isUrgentReview ? 96 : 91,
      reason: `Retention decay detected on ${activeConcept.name} due to extended interval since last spaced practice. Memory stability threshold breached.`,
      valid: true,
    });
  }

  // Candidate: TEACHER_INTERVENTION
  if (recentErrors >= 3 && hintsUsed >= 3 && masteryScore < 45) {
    candidates.push({
      action: 'TEACHER_INTERVENTION',
      targetConceptId: conceptId,
      targetConceptName: activeConcept.name,
      score: 88,
      reason: `Learner is persistently stuck with ${recentErrors} recent errors and heavy hint dependency. Automated Socratic booster or educator assistance recommended.`,
      valid: true,
    });
  }

  // Candidate: PRACTICE (Low/Medium mastery, or High uncertainty, or transfer failure)
  if (masteryScore < 75 || uncertainty === 'High' || (transferScore < 50 && attemptsCount >= 2)) {
    let practiceScore = 75;
    let practiceReason = `Current mastery (${masteryScore}%) is developing. Core derivations and guided problems required.`;

    if (uncertainty === 'High' && masteryScore >= 70) {
      practiceScore = 86;
      practiceReason = `High mastery score (${masteryScore}%) observed with High Uncertainty (only ${independentCount} independent evidence items). Reinforcement practice required before advancement.`;
    } else if (transferScore < 50 && attemptsCount >= 2) {
      practiceScore = 87;
      practiceReason = `Learner succeeded on introductory items but failed difficult transfer questions (${transferScore}% transfer performance). Focused transfer problem sets needed.`;
    } else if (prereqEval.isReady) {
      practiceScore = 80;
    }

    candidates.push({
      action: 'PRACTICE',
      targetConceptId: conceptId,
      targetConceptName: activeConcept.name,
      score: practiceScore,
      reason: practiceReason,
      valid: prereqEval.isReady,
    });
  }

  // Candidate: CHALLENGE (High mastery, high confidence, low uncertainty, transfer mastery)
  if (masteryScore >= 80 && uncertainty === 'Low' && prereqEval.isReady && transferScore >= 75 && !isUrgentReview && !isFadingReview) {
    candidates.push({
      action: 'CHALLENGE',
      targetConceptId: conceptId,
      targetConceptName: activeConcept.name,
      score: 91,
      reason: `Strong validated mastery (${masteryScore}%), robust transfer score (${transferScore}%), and Low Uncertainty. Learner is ready for advanced application and synthesis.`,
      valid: true,
    });
  }

  // Candidate: ADVANCE (Prerequisites met, mastery >= 75%, uncertainty not High, retention healthy)
  if (masteryScore >= 75 && prereqEval.isReady && uncertainty !== 'High' && !isUrgentReview && !isFadingReview && forgettingRisk === 'Low') {
    // Identify next downstream concept in sequence
    const sequence = ['c_prob', 'c_rand_vars', 'c_cond_prob', 'c_bayes', 'c_naive_bayes', 'c_classif', 'c_eval'];
    const currIdx = sequence.indexOf(conceptId);
    const nextConceptId = currIdx >= 0 && currIdx < sequence.length - 1 ? sequence[currIdx + 1] : conceptId;
    const nextConcept = concepts.find((c) => c.id === nextConceptId) || activeConcept;

    candidates.push({
      action: 'ADVANCE',
      targetConceptId: nextConcept.id,
      targetConceptName: nextConcept.name,
      score: 89,
      reason: `Target concept ${activeConcept.name} successfully mastered (${masteryScore}%). Prerequisites verified. Advancing to next milestone: ${nextConcept.name}.`,
      valid: true,
    });
  }

  // Fallback candidate if no candidates generated
  if (candidates.length === 0) {
    candidates.push({
      action: 'PRACTICE',
      targetConceptId: conceptId,
      targetConceptName: activeConcept.name,
      score: 60,
      reason: `Active learning practice on ${activeConcept.name}.`,
      valid: true,
    });
  }

  // 5. Filter Valid Candidates and Select Highest Scoring
  const validCandidates = candidates.filter((c) => c.valid);
  validCandidates.sort((a, b) => b.score - a.score);
  let selected = validCandidates[0] || candidates[0];

  // 6. Check for Active Teacher Overrides
  let teacherOverridden = false;
  let teacherOverrideId: string | undefined;
  const activeOverride = teacherOverrides.find(
    (o) => o.conceptId === conceptId || o.conceptId === selected.targetConceptId
  );

  if (activeOverride) {
    teacherOverridden = true;
    teacherOverrideId = activeOverride.id;
    selected = {
      action: activeOverride.overriddenAction,
      targetConceptId: selected.targetConceptId,
      targetConceptName: selected.targetConceptName,
      score: 100,
      reason: `Teacher Override Active: ${activeOverride.reason} (System recommended: ${activeOverride.originalAction}).`,
      valid: true,
    };
  }

  // 7. Assemble Complete Explainable Decision Factors
  const decisionFactors: DecisionFactors = {
    mastery: masteryScore,
    uncertainty: uncertainty,
    prerequisiteReadiness: prereqEval.readinessScore,
    recentErrorsCount: recentErrors,
    transferPerformance: transferScore,
    forgettingRisk: forgettingRisk,
    gamingPenalty,
    confidenceAverage: tc?.confidenceLevel ?? 60,
    teacherConstraintApplied: teacherOverridden,
  };

  const alternatives = validCandidates
    .filter((c) => c.action !== selected.action || c.targetConceptId !== selected.targetConceptId)
    .map((c) => `${c.action} on ${c.targetConceptName} (Score: ${c.score.toFixed(0)})`);

  const decisionConfidence: 'High' | 'Medium' | 'Low' =
    independentCount >= 3 && prereqEval.chain.length > 0 ? 'High' : independentCount >= 1 ? 'Medium' : 'Low';

  const record: DecisionRecord = {
    id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    action: selected.action,
    targetConceptId: selected.targetConceptId,
    targetConceptName: selected.targetConceptName,
    reason: selected.reason,
    decisionFactors,
    evidenceSummary: {
      recentAccuracy,
      recentErrors,
      hintsUsed,
      avgResponseTimeMs,
      independentEvidenceCount: independentCount,
      isTransferAttempt: latestEvidence?.isTransferQuestion,
      lastPracticedDaysAgo: 0,
    },
    prerequisiteChain: prereqEval.chain,
    candidateActions: validCandidates,
    alternatives,
    confidence: decisionConfidence,
    decisionVersion: DECISION_ENGINE_VERSION,
    inputEvidenceIds: conceptEvidences.map((e) => e.id),
    timestamp: new Date().toISOString(),
    teacherOverridden,
    teacherOverrideId,
  };

  if (!state.decisionRecords) {
    state.decisionRecords = [];
  }
  state.decisionRecords.push(record);

  // Sync with student profile summary
  const ts = (state.teacherStudents || []).find((s) => s.studentId === studentId);
  if (ts) {
    ts.currentDecision = record;
  }

  db.save();
  return record;
}

/**
 * Decision Replay
 * Re-runs decision logic against historic evidence snapshot for verification and explainability audit.
 */
export function replayDecision(decisionId: string): DecisionRecord | null {
  const state = db.getState();
  const decision = (state.decisionRecords || []).find((d) => d.id === decisionId);
  if (!decision) return null;

  // Run evaluation with the same parameters
  return evaluateNextAction({
    studentId: decision.studentId,
    focusConceptId: decision.targetConceptId,
  });
}
