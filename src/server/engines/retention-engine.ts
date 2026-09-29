import { db } from '../db/store.ts';
import { RetentionRecord } from '../../types.ts';

export interface RetentionAnalysisResult {
  overallRetentionHealth: number;
  records: RetentionRecord[];
  urgentReviewConceptIds: string[];
  fadingConceptIds: string[];
}

/**
 * Retention Engine
 * Implements Ebbinghaus Forgetting Curve with spaced repetition memory stability.
 * R = e^(-t / S), where S = (practiceCount * 3.0) + (masteryScore * 0.15)
 */
export function calculateRetentionHealth(studentId: string): RetentionAnalysisResult {
  const state = db.getState();
  const records = state.retentionRecords.filter((r) => r.studentId === studentId);
  const twinConcepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);

  // If no retention records exist for learned concepts, initialize them
  for (const tc of twinConcepts) {
    if (tc.masteryScore >= 50 && !records.some((r) => r.conceptId === tc.conceptId)) {
      const concept = state.concepts.find((c) => c.id === tc.conceptId);
      const newRec: RetentionRecord = {
        id: `ret_${studentId}_${tc.conceptId}`,
        studentId,
        conceptId: tc.conceptId,
        conceptName: concept?.name || tc.conceptId,
        subjectName: 'Machine Learning',
        learnedAt: tc.lastAssessedAt || new Date().toISOString(),
        lastPracticedAt: tc.lastPracticedAt || new Date().toISOString(),
        practiceCount: Math.max(1, tc.attemptsCount),
        masteryScore: tc.masteryScore,
        reviewCount: 0,
        daysSincePractice: 0,
        status: 'Healthy',
        nextScheduledReview: new Date(Date.now() + 7 * 86400000).toISOString(),
      };
      state.retentionRecords.push(newRec);
      records.push(newRec);
    }
  }

  if (records.length === 0) {
    return {
      overallRetentionHealth: 85,
      records: [],
      urgentReviewConceptIds: [],
      fadingConceptIds: [],
    };
  }

  let totalHealthWeight = 0;
  const urgentReviewConceptIds: string[] = [];
  const fadingConceptIds: string[] = [];

  for (const rec of records) {
    // Keep mastery score synced with twin concept
    const tc = twinConcepts.find((c) => c.conceptId === rec.conceptId);
    if (tc) {
      rec.masteryScore = tc.masteryScore;
    }

    // Memory stability S increases with spaced practice count and baseline mastery
    const stability = Math.max(1.5, (rec.practiceCount * 2.8) + (rec.masteryScore * 0.12));
    const days = rec.daysSincePractice ?? 0;
    const decayExponent = days / stability;
    
    // Retention probability R = e^(-t/S)
    const retentionScore = Math.max(10, Math.min(100, Math.round(100 * Math.exp(-decayExponent * 0.35))));

    if (retentionScore >= 75) {
      rec.status = 'Healthy';
      if (tc) tc.forgettingRisk = 'Low';
    } else if (retentionScore >= 55) {
      rec.status = 'Fading';
      fadingConceptIds.push(rec.conceptId);
      if (tc) tc.forgettingRisk = 'Medium';
    } else {
      rec.status = 'Needs Revision';
      urgentReviewConceptIds.push(rec.conceptId);
      if (tc) tc.forgettingRisk = 'High';
    }

    totalHealthWeight += retentionScore;
  }

  const overallRetentionHealth = Math.round(totalHealthWeight / records.length);

  // Sync with twin
  const twin = state.learningTwins.find((t) => t.studentId === studentId);
  if (twin) {
    twin.retentionHealth = overallRetentionHealth;
  }
  db.save();

  return {
    overallRetentionHealth,
    records,
    urgentReviewConceptIds,
    fadingConceptIds,
  };
}

export function recordPracticeSession(studentId: string, conceptId: string) {
  const state = db.getState();
  let rec = state.retentionRecords.find((r) => r.studentId === studentId && r.conceptId === conceptId);
  if (!rec) {
    const concept = state.concepts.find((c) => c.id === conceptId);
    rec = {
      id: `ret_${studentId}_${conceptId}`,
      studentId,
      conceptId,
      conceptName: concept?.name || conceptId,
      subjectName: 'Machine Learning',
      learnedAt: new Date().toISOString(),
      lastPracticedAt: new Date().toISOString(),
      practiceCount: 1,
      masteryScore: 70,
      reviewCount: 1,
      daysSincePractice: 0,
      status: 'Healthy',
      nextScheduledReview: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
    state.retentionRecords.push(rec);
  } else {
    rec.practiceCount += 1;
    rec.reviewCount += 1;
    rec.daysSincePractice = 0;
    rec.lastPracticedAt = new Date().toISOString();
    rec.status = 'Healthy';
    rec.nextScheduledReview = new Date(Date.now() + Math.min(30, (rec.reviewCount + 1) * 5) * 86400000).toISOString();
  }

  const tc = state.learningTwinConcepts.find((c) => c.studentId === studentId && c.conceptId === conceptId);
  if (tc) {
    tc.forgettingRisk = 'Low';
    tc.lastPracticedAt = new Date().toISOString();
  }

  db.save();
}
