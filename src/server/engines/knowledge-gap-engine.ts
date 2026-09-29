import { db } from '../db/store.ts';
import { KnowledgeGap } from '../../types.ts';
import { evaluatePrerequisiteReadiness } from './prerequisite-engine.ts';

/**
 * Knowledge Gap Engine
 * Identifies root causes of concept deficiencies and traces missing prerequisites.
 */
export function detectKnowledgeGaps(studentId: string): KnowledgeGap[] {
  const state = db.getState();
  const twinConcepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);
  const concepts = state.concepts;

  const newlyDetectedOrUpdatedGaps: KnowledgeGap[] = [];

  for (const tc of twinConcepts) {
    const currentConcept = concepts.find((c) => c.id === tc.conceptId);
    if (!currentConcept) continue;

    const prereqEval = evaluatePrerequisiteReadiness({ studentId, conceptId: tc.conceptId });

    // If student mastery is weak (< 65%) or prerequisite is unsatisfied
    if (tc.masteryScore < 65 || !prereqEval.isReady) {
      let missingPrereqId: string | undefined;
      let missingPrereqName: string | undefined;
      let underlyingGapConcept = 'Foundational Definitions';
      let reason = `Mastery at ${tc.masteryScore}% with uncertainty (${tc.uncertainty || 'Medium'}). Frequent errors during verification.`;

      if (!prereqEval.isReady && prereqEval.deficientPrerequisites.length > 0) {
        const primaryDeficient = prereqEval.deficientPrerequisites[0];
        missingPrereqId = primaryDeficient.conceptId;
        missingPrereqName = primaryDeficient.conceptName;
        reason = `Struggles in ${currentConcept.name} trace back to prerequisite gap in ${primaryDeficient.conceptName} (${primaryDeficient.masteryScore}% < ${primaryDeficient.threshold}% required).`;
        underlyingGapConcept = primaryDeficient.conceptName;
      }

      // Check if gap already exists in db
      const existingGap = state.knowledgeGaps.find(
        (g) => g.studentId === studentId && g.conceptId === tc.conceptId && g.status !== 'RESOLVED'
      );

      const severity: 'Critical' | 'Moderate' | 'Mild' =
        tc.masteryScore < 40 ? 'Critical' : tc.masteryScore < 55 ? 'Moderate' : 'Mild';

      if (existingGap) {
        existingGap.masteryScore = tc.masteryScore;
        existingGap.severity = severity;
        existingGap.reason = reason;
        if (missingPrereqId) {
          existingGap.missingPrerequisiteId = missingPrereqId;
          existingGap.missingPrerequisiteName = missingPrereqName;
          existingGap.underlyingGapConcept = underlyingGapConcept;
        }
        newlyDetectedOrUpdatedGaps.push(existingGap);
      } else {
        const newGap: KnowledgeGap = {
          id: `gap_${Date.now()}_${tc.conceptId}`,
          studentId,
          conceptId: tc.conceptId,
          conceptName: currentConcept.name,
          severity,
          masteryScore: tc.masteryScore,
          reason,
          missingPrerequisiteId: missingPrereqId,
          missingPrerequisiteName: missingPrereqName,
          underlyingGapConcept,
          status: 'UNRESOLVED',
          detectedAt: new Date().toISOString(),
        };
        state.knowledgeGaps.push(newGap);
        newlyDetectedOrUpdatedGaps.push(newGap);
      }
    } else {
      // If mastery is now >= 75 and prerequisites are met, mark previous gap as RESOLVED!
      const existingGap = state.knowledgeGaps.find(
        (g) => g.studentId === studentId && g.conceptId === tc.conceptId && g.status !== 'RESOLVED'
      );
      if (existingGap) {
        existingGap.status = 'RESOLVED';
        existingGap.resolvedAt = new Date().toISOString();
      }
    }
  }

  db.save();
  return state.knowledgeGaps.filter((g) => g.studentId === studentId && g.status !== 'RESOLVED');
}
