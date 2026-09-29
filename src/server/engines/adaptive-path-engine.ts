import { db } from '../db/store.ts';
import { AdaptiveLearningPath, AdaptivePathStep, LearningPathItem } from '../../types.ts';
import { evaluateNextAction } from './decision-engine.ts';
import { evaluatePrerequisiteReadiness } from './prerequisite-engine.ts';

/**
 * Adaptive Path Engine
 * Generates personalized, dynamically ordered pathways based on Decision Engine output.
 */
export function generateAdaptiveLearningPath(studentId: string, subjectId: string = 'sub_ml'): AdaptiveLearningPath {
  const state = db.getState();
  const concepts = state.concepts.filter((c) => c.subjectId === subjectId);
  const twinConcepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);
  const activeGaps = state.knowledgeGaps.filter((g) => g.studentId === studentId && g.status !== 'RESOLVED');

  // Evaluate current recommended decision
  const currentDecision = evaluateNextAction({ studentId });

  // Standard conceptual progression
  const sequence = [
    'c_prob',
    'c_rand_vars',
    'c_cond_prob',
    'c_distr',
    'c_bayes',
    'c_naive_bayes',
    'c_classif',
    'c_eval',
  ];

  const steps: AdaptivePathStep[] = [];

  sequence.forEach((conceptId) => {
    const concept = concepts.find((c) => c.id === conceptId);
    if (!concept) return;

    const tc = twinConcepts.find((item) => item.conceptId === conceptId);
    const mastery = tc ? tc.masteryScore : 0;
    const uncertainty = tc ? tc.uncertainty : 'High';
    const hasActiveGap = activeGaps.some((g) => g.conceptId === conceptId);
    const prereqEval = evaluatePrerequisiteReadiness({ studentId, conceptId });

    let status: 'Completed' | 'In Progress' | 'Recommended Next' | 'Locked' | 'Needs Review';
    let reasonForPlacement = '';

    if (currentDecision.targetConceptId === conceptId) {
      status = 'Recommended Next';
      reasonForPlacement = `Selected by ZONE Decision Engine: ${currentDecision.reason}`;
    } else if (mastery >= 75 && prereqEval.isReady && !hasActiveGap) {
      status = 'Completed';
      reasonForPlacement = `Mastery achieved (${mastery}%). Prerequisites verified.`;
    } else if (hasActiveGap || (!prereqEval.isReady && mastery > 0)) {
      status = 'In Progress';
      reasonForPlacement = `Active prerequisite bottleneck: ${prereqEval.explanation}`;
    } else if (prereqEval.isReady) {
      status = 'In Progress';
      reasonForPlacement = 'Prerequisites satisfied. Ready for structured practice.';
    } else {
      status = 'Locked';
      reasonForPlacement = `Prerequisites unfulfilled: ${prereqEval.deficientPrerequisites.map((d) => d.conceptName).join(', ')}`;
    }

    steps.push({
      conceptId: concept.id,
      conceptName: concept.name,
      status,
      masteryScore: mastery,
      uncertainty,
      prerequisiteGapsCount: prereqEval.deficientPrerequisites.length,
      estimatedMinutes: concept.estimatedMinutes || 20,
      reasonForPlacement,
      action: currentDecision.targetConceptId === conceptId ? currentDecision.action : undefined,
    });
  });

  return {
    studentId,
    targetGoal: 'Master Machine Learning & Bayesian Reasoning',
    steps,
    updatedAt: new Date().toISOString(),
    currentDecision,
  };
}

export function generateLearningPathItems(studentId: string, subjectId: string = 'sub_ml'): LearningPathItem[] {
  const adaptivePath = generateAdaptiveLearningPath(studentId, subjectId);
  const state = db.getState();

  return adaptivePath.steps.map((step, idx) => {
    const concept = state.concepts.find((c) => c.id === step.conceptId);
    const est = concept?.estimatedMinutes || 20;

    return {
      id: `path_${step.conceptId}`,
      conceptId: step.conceptId,
      conceptName: step.conceptName,
      order: idx + 1,
      status: step.status as any,
      mastery: step.masteryScore,
      uncertainty: step.uncertainty,
      decisionAction: step.action,
      estimatedMinutes: est,
      reasonForPlacement: step.reasonForPlacement,
      activities: [
        {
          type: 'Video',
          title: `Video Lesson: Intuitive ${step.conceptName}`,
          duration: `${Math.round(est * 0.4)} min`,
          completed: step.masteryScore >= 50,
        },
        {
          type: 'Practice',
          title: `Interactive Practice & Proofs`,
          duration: `${Math.round(est * 0.4)} min`,
          completed: step.masteryScore >= 75,
        },
        {
          type: 'Quiz',
          title: `ZONE Diagnostic Check`,
          duration: `${Math.round(est * 0.2)} min`,
          completed: step.masteryScore >= 80,
        },
      ],
    };
  });
}
