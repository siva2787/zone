import { db } from '../db/store.ts';
import { Concept, ConceptPrerequisite, PrerequisiteChainNode } from '../../types.ts';

export interface PrerequisiteReadinessResult {
  isReady: boolean;
  readinessScore: number; // 0 - 100
  deficientPrerequisites: PrerequisiteChainNode[];
  chain: PrerequisiteChainNode[];
  bottleneckConcept?: Concept;
  explanation: string;
}

/**
 * Prerequisite Engine
 * Manages the prerequisite dependency graph and assesses readiness for target concepts.
 */
export function evaluatePrerequisiteReadiness(params: {
  studentId: string;
  conceptId: string;
  threshold?: number;
}): PrerequisiteReadinessResult {
  const { studentId, conceptId, threshold = 70 } = params;
  const state = db.getState();
  const concepts = state.concepts;
  const prerequisites = state.prerequisites;
  const twinConcepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);

  const directPrereqs = prerequisites.filter((p) => p.conceptId === conceptId);

  if (directPrereqs.length === 0) {
    return {
      isReady: true,
      readinessScore: 100,
      deficientPrerequisites: [],
      chain: [],
      explanation: 'Foundational topic with no prerequisites required.',
    };
  }

  const chain: PrerequisiteChainNode[] = [];
  const deficientPrerequisites: PrerequisiteChainNode[] = [];
  let totalScore = 0;

  for (const pr of directPrereqs) {
    const prereqConcept = concepts.find((c) => c.id === pr.prerequisiteConceptId);
    const prereqTc = twinConcepts.find((tc) => tc.conceptId === pr.prerequisiteConceptId);
    const score = prereqTc ? prereqTc.masteryScore : 0;
    const reqThreshold = pr.minimumMasteryThreshold || threshold;

    const node: PrerequisiteChainNode = {
      conceptId: pr.prerequisiteConceptId,
      conceptName: prereqConcept?.name || pr.prerequisiteConceptId,
      masteryScore: score,
      status: score >= reqThreshold ? 'SATISFIED' : 'DEFICIENT',
      threshold: reqThreshold,
    };

    chain.push(node);
    totalScore += score;

    if (score < reqThreshold) {
      deficientPrerequisites.push(node);
    }
  }

  const readinessScore = Math.round(totalScore / directPrereqs.length);
  const isReady = deficientPrerequisites.length === 0;

  let bottleneckConcept: Concept | undefined;
  let explanation = '';

  if (isReady) {
    explanation = `All direct prerequisites satisfied (Readiness: ${readinessScore}% ≥ ${threshold}% threshold).`;
  } else {
    // Pick the most deficient prerequisite
    const mostDeficient = deficientPrerequisites.reduce((prev, curr) =>
      curr.masteryScore < prev.masteryScore ? curr : prev
    );
    bottleneckConcept = concepts.find((c) => c.id === mostDeficient.conceptId);

    const names = deficientPrerequisites.map((d) => `${d.conceptName} (${d.masteryScore}% < ${d.threshold}%)`).join(', ');
    explanation = `Prerequisite deficiency detected: ${names}. Student lacks foundational mastery required for this concept.`;
  }

  return {
    isReady,
    readinessScore,
    deficientPrerequisites,
    chain,
    bottleneckConcept,
    explanation,
  };
}

/**
 * Returns recursive ancestors of a concept
 */
export function getAncestorPrerequisites(conceptId: string): string[] {
  const state = db.getState();
  const prerequisites = state.prerequisites;
  const visited = new Set<string>();

  function traverse(cid: string) {
    const direct = prerequisites.filter((p) => p.conceptId === cid);
    for (const d of direct) {
      if (!visited.has(d.prerequisiteConceptId)) {
        visited.add(d.prerequisiteConceptId);
        traverse(d.prerequisiteConceptId);
      }
    }
  }

  traverse(conceptId);
  return Array.from(visited);
}
