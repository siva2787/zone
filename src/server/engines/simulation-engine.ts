import { db } from '../db/store.ts';
import { SimulationResult, DecisionRecord } from '../../types.ts';
import { evaluateNextAction } from './decision-engine.ts';
import { recordAttemptEvidence } from './evidence-engine.ts';
import { updateConceptMasteryFromEvidence } from './mastery-engine.ts';
import { createTeacherOverride } from './intervention-engine.ts';
import { calculateRetentionHealth } from './retention-engine.ts';

export interface StressTestCaseResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
  evidence: any;
  explanation: string;
}

/**
 * Simulation Engine
 * Replays realistic two-learner divergent journeys and executes the automated Judge Stress Test suite.
 */
export function runTwoLearnerSimulation(): SimulationResult {
  const state = db.getState();

  // Setup Learner A (Aarav): Strong Probability (91%), Strong Conditional Probability (86%), Bayes (79%)
  const learnerAId = 'usr_learner_a';
  // Setup Learner B (Siva / Learner B): Strong Probability (91%), Weak Conditional Probability (43%), Bayes (79%)
  const learnerBId = 'usr_learner_b';

  // Seed Learner A
  setLearnerConcept(learnerAId, 'c_prob', 91, 'Low', 6, 6, 0);
  setLearnerConcept(learnerAId, 'c_cond_prob', 86, 'Low', 5, 5, 0);
  setLearnerConcept(learnerAId, 'c_bayes', 79, 'Low', 4, 3, 1, 80);

  // Seed Learner B
  setLearnerConcept(learnerBId, 'c_prob', 91, 'Low', 6, 6, 0);
  setLearnerConcept(learnerBId, 'c_cond_prob', 43, 'Medium', 7, 3, 4);
  setLearnerConcept(learnerBId, 'c_bayes', 79, 'Medium', 4, 3, 1, 40);

  // Run the REAL Decision Engine for both
  const decisionA = evaluateNextAction({
    studentId: learnerAId,
    focusConceptId: 'c_bayes',
  });

  const decisionB = evaluateNextAction({
    studentId: learnerBId,
    focusConceptId: 'c_bayes',
  });

  const comparisonExplanation =
    `Learner A (Aarav) and Learner B received the exact same score on Bayes Theorem (79%). ` +
    `However, because Learner A verified prerequisite readiness in Conditional Probability (86% ≥ 70%), ZONE recommends ${decisionA.action} (${decisionA.targetConceptName}). ` +
    `Learner B possesses an unmastered prerequisite in Conditional Probability (43% < 70%), so ZONE strictly routes to ${decisionB.action} (${decisionB.targetConceptName}) before allowing downstream advancement.`;

  return {
    learnerA: {
      studentId: learnerAId,
      name: 'Learner A (Aarav — Strong Foundations)',
      conceptMastery: {
        'Probability Fundamentals': 91,
        'Conditional Probability': 86,
        'Bayes Theorem': 79,
      },
      evidenceCount: 15,
      decision: decisionA,
    },
    learnerB: {
      studentId: learnerBId,
      name: 'Learner B (Weak Prerequisite Gap)',
      conceptMastery: {
        'Probability Fundamentals': 91,
        'Conditional Probability': 43,
        'Bayes Theorem': 79,
      },
      evidenceCount: 15,
      decision: decisionB,
    },
    comparisonExplanation,
  };
}

function setLearnerConcept(
  studentId: string,
  conceptId: string,
  masteryScore: number,
  uncertainty: 'Low' | 'Medium' | 'High',
  attemptsCount: number,
  correctCount: number,
  incorrectCount: number,
  transferScore: number = 70
) {
  const state = db.getState();
  let tc = state.learningTwinConcepts.find((c) => c.studentId === studentId && c.conceptId === conceptId);
  if (!tc) {
    tc = {
      id: `ltc_${studentId}_${conceptId}`,
      studentId,
      conceptId,
      masteryScore,
      uncertainty,
      confidenceLevel: masteryScore,
      attemptsCount,
      correctCount,
      incorrectCount,
      recentAccuracy: Math.round((correctCount / Math.max(1, attemptsCount)) * 100),
      weightedAccuracy: masteryScore,
      avgResponseTimeMs: 14000,
      hintsUsed: 0,
      retryCount: 0,
      independentEvidenceCount: correctCount,
      forgettingRisk: 'Low',
      transferScore,
      status: masteryScore >= 75 ? 'Mastered' : masteryScore < 50 ? 'Gap' : 'Learning',
      lastAssessedAt: new Date().toISOString(),
      lastPracticedAt: new Date().toISOString(),
    };
    state.learningTwinConcepts.push(tc);
  } else {
    tc.masteryScore = masteryScore;
    tc.uncertainty = uncertainty;
    tc.attemptsCount = attemptsCount;
    tc.correctCount = correctCount;
    tc.incorrectCount = incorrectCount;
    tc.transferScore = transferScore;
    tc.status = masteryScore >= 75 ? 'Mastered' : masteryScore < 50 ? 'Gap' : 'Learning';
  }
}

/**
 * Runs the 8 Judge Stress Tests against the real deterministic engines.
 */
export function runJudgeStressTests(): StressTestCaseResult[] {
  const results: StressTestCaseResult[] = [];
  const testStudent = 'usr_stress_tester';

  // TEST 1: Easy questions correct -> difficult transfer failure
  {
    const student = `usr_stress_t1_${Date.now()}`;
    const conceptId = 'c_prob';
    // Clear and add 3 easy correct attempts
    for (let i = 1; i <= 3; i++) {
      recordAttemptEvidence({
        studentId: student,
        conceptId,
        questionId: `q_easy_${i}`,
        selectedOption: 'Correct',
        responseTimeMs: 15000,
        confidence: 'High',
        hintsUsed: 0,
      });
    }
    // Now submit 1 hard transfer question failure
    const transferAttempt = recordAttemptEvidence({
      studentId: student,
      conceptId,
      questionId: 'q_transfer_fail',
      selectedOption: 'Wrong',
      responseTimeMs: 25000,
      confidence: 'Medium',
      hintsUsed: 0,
      isTransferQuestion: true,
    });
    const update = updateConceptMasteryFromEvidence({
      studentId: student,
      conceptId,
      latestEvidence: transferAttempt.evidence,
    });
    const dec = evaluateNextAction({ studentId: student, focusConceptId: conceptId });

    const passed = update.conceptState.masteryScore <= 70 && dec.action !== 'ADVANCE';
    results.push({
      id: 'TEST_1',
      name: 'Easy Success followed by Difficult Transfer Failure',
      description: 'Learner correctly answers 3 easy questions but fails a hard transfer item.',
      passed,
      expected: 'Mastery is capped (< 70%), uncertainty increases, Action becomes PRACTICE/REVIEW instead of ADVANCE.',
      actual: `Mastery: ${update.conceptState.masteryScore}%, Uncertainty: ${update.uncertainty}, Action: ${dec.action}`,
      evidence: { mastery: update.conceptState.masteryScore, uncertainty: update.uncertainty, action: dec.action },
      explanation: 'ZONE protects against superficial memorization by capping mastery when real-world transfer fails.',
    });
  }

  // TEST 2: Strong Concept with Weak Prerequisite
  {
    const student = `usr_prereq_test_${Date.now()}`;
    setLearnerConcept(student, 'c_prob', 90, 'Low', 5, 5, 0);
    setLearnerConcept(student, 'c_cond_prob', 42, 'Medium', 6, 2, 4); // Deficient prerequisite
    setLearnerConcept(student, 'c_bayes', 80, 'Medium', 4, 3, 1);

    const dec = evaluateNextAction({ studentId: student, focusConceptId: 'c_bayes' });
    const passed = dec.action === 'REMEDIATE_PREREQUISITE' && dec.targetConceptId === 'c_cond_prob';

    results.push({
      id: 'TEST_2',
      name: 'Strong Concept with Weak Prerequisite',
      description: 'Learner achieves 80% on Bayes Theorem but only 42% on Conditional Probability.',
      passed,
      expected: 'REMEDIATE_PREREQUISITE on Conditional Probability (threshold 70%).',
      actual: `Action: ${dec.action}, Target: ${dec.targetConceptName} (${dec.targetConceptId})`,
      evidence: { action: dec.action, targetConceptId: dec.targetConceptId, reason: dec.reason },
      explanation: 'The prerequisite engine enforces strict prerequisite readiness before validating advancement.',
    });
  }

  // TEST 3: Repeated Rapid Guessing (Anti-Gaming)
  {
    const student = `usr_gaming_test_${Date.now()}`;
    const conceptId = 'c_naive_bayes';
    // 3 rapid fails in 2 seconds
    for (let i = 0; i < 3; i++) {
      recordAttemptEvidence({
        studentId: student,
        conceptId,
        questionId: 'q_same_item',
        selectedOption: 'Guess',
        responseTimeMs: 800,
        confidence: 'Low',
      });
    }
    // Then 1 quick correct answer
    const luckyAttempt = recordAttemptEvidence({
      studentId: student,
      conceptId,
      questionId: 'q_same_item',
      selectedOption: 'Correct',
      responseTimeMs: 900,
      confidence: 'Low',
    });

    const update = updateConceptMasteryFromEvidence({
      studentId: student,
      conceptId,
      latestEvidence: luckyAttempt.evidence,
    });

    const passed = luckyAttempt.antiGaming.evidenceWeight <= 0.5 && update.conceptState.masteryScore < 60;
    results.push({
      id: 'TEST_3',
      name: 'Anti-Gaming Defense against Rapid Guessing',
      description: 'Learner spams 3 rapid wrong answers then quickly guesses the correct option within 900ms.',
      passed,
      expected: 'Evidence downweighted (weight ≤ 0.5), gaming signals logged, mastery not naively inflated.',
      actual: `Evidence Weight: ${luckyAttempt.antiGaming.evidenceWeight}, Mastery: ${update.conceptState.masteryScore}%, Signals: ${luckyAttempt.antiGaming.gamingSignals.length}`,
      evidence: luckyAttempt.antiGaming,
      explanation: 'Anti-gaming engine flags rapid guessing and prevents artificial mastery inflation.',
    });
  }

  // TEST 4: Long Learning Gap -> Spaced Retention Decay
  {
    const student = `usr_retention_test_${Date.now()}`;
    const conceptId = 'c_lin_reg';
    setLearnerConcept(student, conceptId, 85, 'Low', 6, 5, 1);

    const state = db.getState();
    let rec = state.retentionRecords.find((r) => r.studentId === student && r.conceptId === conceptId);
    if (!rec) {
      rec = {
        id: `ret_${student}_${conceptId}`,
        studentId: student,
        conceptId,
        conceptName: 'Linear Regression',
        subjectName: 'Machine Learning',
        learnedAt: '2026-08-01T00:00:00.000Z',
        lastPracticedAt: '2026-08-01T00:00:00.000Z',
        practiceCount: 2,
        masteryScore: 85,
        reviewCount: 0,
        daysSincePractice: 25, // 25 days decay
        status: 'Needs Revision',
        nextScheduledReview: new Date().toISOString(),
      };
      state.retentionRecords.push(rec);
    } else {
      rec.daysSincePractice = 25;
      rec.practiceCount = 2;
    }

    calculateRetentionHealth(student);
    const dec = evaluateNextAction({ studentId: student, focusConceptId: conceptId });

    const passed = dec.action === 'REVIEW';
    results.push({
      id: 'TEST_4',
      name: 'Long Gap Memory Decay triggers Spaced REVIEW',
      description: 'Learner previously mastered Linear Regression (85%) but has not practiced for 25 days.',
      passed,
      expected: 'Action becomes REVIEW due to retention probability drop.',
      actual: `Action: ${dec.action}, Reason: ${dec.reason.substring(0, 80)}...`,
      evidence: { action: dec.action, daysSincePractice: 25 },
      explanation: 'Ebbinghaus forgetting curve triggers proactive spaced review before irreversible forgetting occurs.',
    });
  }

  // TEST 5: Persistent Teacher Override
  {
    const student = `usr_override_test_${Date.now()}`;
    setLearnerConcept(student, 'c_bayes', 45, 'High', 3, 1, 2);

    const initialDec = evaluateNextAction({ studentId: student, focusConceptId: 'c_bayes' });
    const override = createTeacherOverride({
      studentId: student,
      conceptId: 'c_bayes',
      teacherId: 'usr_teacher_1',
      originalAction: initialDec.action,
      overriddenAction: 'ADVANCE',
      reason: 'Instructor confirmed verbal mastery in laboratory demonstration.',
      decisionId: initialDec.id,
    });

    const activeDec = evaluateNextAction({ studentId: student, focusConceptId: 'c_bayes' });
    const passed = activeDec.action === 'ADVANCE' && activeDec.teacherOverridden === true;

    results.push({
      id: 'TEST_5',
      name: 'Persistent Teacher Override & Audit Logging',
      description: 'Instructor overrides system PRACTICE recommendation to ADVANCE with clinical justification.',
      passed,
      expected: 'Action is overridden to ADVANCE, override is persisted, and teacherOverridden flag is true.',
      actual: `Action: ${activeDec.action}, Overridden: ${activeDec.teacherOverridden}, OverrideId: ${override.id}`,
      evidence: override,
      explanation: 'Teacher overrides are preserved with full audit trail while keeping historic evidence intact.',
    });
  }

  // TEST 6: Same Latest Score, Different Histories
  {
    const sim = runTwoLearnerSimulation();
    const passed = sim.learnerA.decision.action !== sim.learnerB.decision.action;

    results.push({
      id: 'TEST_6',
      name: 'Identical Latest Score with Different Histories Diverges Paths',
      description: 'Learner A and Learner B both score 79% on Bayes Theorem with differing prerequisite mastery.',
      passed,
      expected: 'Learner A receives CHALLENGE/ADVANCE, Learner B receives REMEDIATE_PREREQUISITE.',
      actual: `Learner A: ${sim.learnerA.decision.action}, Learner B: ${sim.learnerB.decision.action}`,
      evidence: { decisionA: sim.learnerA.decision.action, decisionB: sim.learnerB.decision.action },
      explanation: sim.comparisonExplanation,
    });
  }

  // TEST 7: Cold-Start Learner Diagnostic
  {
    const student = `usr_cold_start_${Date.now()}`;
    // Diagnostic question on Probability Fundamentals
    const att = recordAttemptEvidence({
      studentId: student,
      conceptId: 'c_prob',
      questionId: 'q_diag_1',
      selectedOption: '1/2',
      responseTimeMs: 12000,
      confidence: 'High',
      hintsUsed: 0,
      questionType: 'DIAGNOSTIC',
    });
    const update = updateConceptMasteryFromEvidence({
      studentId: student,
      conceptId: 'c_prob',
      latestEvidence: att.evidence,
    });
    const dec = evaluateNextAction({ studentId: student });

    const passed = update.conceptState.masteryScore > 0 && Boolean(dec.action);
    results.push({
      id: 'TEST_7',
      name: 'Cold-Start Concept-Aware Diagnostic Calibration',
      description: 'New learner submits first diagnostic question with zero initial history.',
      passed,
      expected: 'Mastery is calibrated from concept evidence and first explainable decision is emitted.',
      actual: `Mastery: ${update.conceptState.masteryScore}%, Uncertainty: ${update.uncertainty}, Action: ${dec.action}`,
      evidence: { mastery: update.conceptState.masteryScore, action: dec.action },
      explanation: 'Diagnostic questions map directly to concept nodes and establish the initial cognitive twin.',
    });
  }

  // TEST 8: High Mastery with High Uncertainty
  {
    const student = `usr_uncertainty_test_${Date.now()}`;
    const conceptId = 'c_prob'; // Foundational concept with no prerequisites
    // 1 single lucky guess on an advanced question
    const att = recordAttemptEvidence({
      studentId: student,
      conceptId,
      questionId: 'q_diag_1',
      selectedOption: '1/2',
      responseTimeMs: 14000,
      confidence: 'Medium',
      hintsUsed: 0,
    });
    const update = updateConceptMasteryFromEvidence({
      studentId: student,
      conceptId,
      latestEvidence: att.evidence,
    });
    const dec = evaluateNextAction({ studentId: student, focusConceptId: conceptId });

    const passed = update.uncertainty === 'High' && dec.action !== 'ADVANCE';
    results.push({
      id: 'TEST_8',
      name: 'High Score with High Uncertainty does not Blindly Advance',
      description: 'Learner gets 1 question right but possesses only 1 piece of independent evidence (High Uncertainty).',
      passed,
      expected: 'Uncertainty remains High, Decision Engine chooses PRACTICE/VERIFY instead of ADVANCE.',
      actual: `Uncertainty: ${update.uncertainty}, Action: ${dec.action}, Reason: ${dec.reason.substring(0, 60)}...`,
      evidence: { uncertainty: update.uncertainty, action: dec.action },
      explanation: 'ZONE treats uncertainty as a first-class cognitive dimension to prevent premature advancement.',
    });
  }

  return results;
}
