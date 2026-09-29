import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db/store.ts';
import { updateTwinMastery, updateConceptMasteryFromEvidence } from './src/server/engines/mastery-engine.ts';
import { detectKnowledgeGaps } from './src/server/engines/knowledge-gap-engine.ts';
import { generateAdaptiveLearningPath, generateLearningPathItems } from './src/server/engines/adaptive-path-engine.ts';
import { calculateRetentionHealth, recordPracticeSession } from './src/server/engines/retention-engine.ts';
import { recordAttemptEvidence, getStudentEvidence } from './src/server/engines/evidence-engine.ts';
import { evaluateNextAction, replayDecision } from './src/server/engines/decision-engine.ts';
import { evaluatePrerequisiteReadiness } from './src/server/engines/prerequisite-engine.ts';
import {
  createTeacherOverride,
  getTeacherOverrides,
  revokeTeacherOverride,
  getLiveCohortAnalytics,
} from './src/server/engines/intervention-engine.ts';
import { runTwoLearnerSimulation, runJudgeStressTests } from './src/server/engines/simulation-engine.ts';
import { generateTutorResponse } from './src/server/ai-tutor-service.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 5MB limit for attachments/profiles
  app.use(express.json({ limit: '5mb' }));

  // Session user tracking (Clean-slate default: unauthenticated until login/register)
  let currentUserId = '';

  // =================== AUTH ROUTES ===================
  app.get('/api/auth/current-user', (req, res) => {
    const state = db.getState();
    const user = state.users.find((u) => u.id === currentUserId);
    if (!user) {
      return res.json({ user: null, profile: null });
    }
    const profile =
      user.role === 'STUDENT'
        ? state.studentProfiles.find((p) => p.userId === user.id)
        : state.teacherProfiles.find((p) => p.userId === user.id);

    res.json({ user, profile });
  });

  app.post('/api/auth/switch-role', (req, res) => {
    const { role } = req.body;
    const state = db.getState();
    let user = state.users.find((u) => u.role === role);
    
    // If switching role when no user of that role exists, create one for testing
    if (!user) {
      const newId = `usr_${role.toLowerCase()}_${Date.now()}`;
      user = {
        id: newId,
        name: role === 'TEACHER' ? 'Faculty Instructor' : 'Active Learner',
        email: `${role.toLowerCase()}@university.edu`,
        role: role as 'STUDENT' | 'TEACHER',
        avatarUrl: role === 'TEACHER'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };
      state.users.push(user);
      if (role === 'TEACHER') {
        state.teacherProfiles.push({
          id: `prof_${newId}`,
          userId: newId,
          department: 'Computer Science & AI',
          title: 'Professor of Machine Learning',
          institution: 'ZONE Institute of Intelligence',
        });
      } else {
        state.studentProfiles.push({
          id: `prof_${newId}`,
          userId: newId,
          department: 'AI & Data Science',
          yearSemester: '3rd Year',
          college: 'ZONE Engineering College',
          learningMode: 'Visual',
          studyConsistency: 'High',
          avgSessionMinutes: 25,
          learningStreakDays: 0,
        });
      }
      db.save();
    }

    currentUserId = user.id;
    res.json({ success: true, user });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const state = db.getState();
    let user = state.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    
    // If logging in with a new email, create the account dynamically
    if (!user) {
      const newId = `usr_${Date.now()}`;
      user = {
        id: newId,
        name: (email || 'Learner').split('@')[0],
        email: email || `learner_${Date.now()}@zone.ai`,
        role: (email || '').toLowerCase().includes('teacher') || (email || '').toLowerCase().includes('prof') ? 'TEACHER' as const : 'STUDENT' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
      };
      state.users.push(user);
      if (user.role === 'STUDENT') {
        state.studentProfiles.push({
          id: `prof_${newId}`,
          userId: newId,
          department: 'AI & Data Science',
          yearSemester: '3rd Year',
          college: 'ZONE Engineering College',
          learningMode: 'Visual',
          studyConsistency: 'High',
          avgSessionMinutes: 25,
          learningStreakDays: 0,
        });
      } else {
        state.teacherProfiles.push({
          id: `prof_${newId}`,
          userId: newId,
          department: 'Computer Science & Engineering',
          title: 'Department Head',
          institution: 'ZONE Institute',
        });
      }
      db.save();
    }

    currentUserId = user.id;
    res.json({ success: true, user });
  });

  app.post('/api/auth/logout', (req, res) => {
    currentUserId = '';
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.delete('/api/auth/profile', (req, res) => {
    const state = db.getState();
    const deletedUserId = currentUserId;
    state.users = state.users.filter((u) => u.id !== deletedUserId);
    state.studentProfiles = state.studentProfiles.filter((p) => p.userId !== deletedUserId);
    state.learningTwins = state.learningTwins.filter((t) => t.studentId !== deletedUserId);
    state.knowledgeGaps = state.knowledgeGaps.filter((g) => g.studentId !== deletedUserId);
    db.save();

    currentUserId = '';
    res.json({ success: true, message: 'Profile deleted successfully' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email } = req.body;
    const state = db.getState();
    const newId = `usr_${Date.now()}`;
    const newUser = {
      id: newId,
      name: name || 'Learner',
      email: email || `user_${Date.now()}@example.com`,
      role: 'STUDENT' as const,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
    state.users.push(newUser);
    currentUserId = newUser.id;

    const profile = {
      id: `prof_${newId}`,
      userId: newId,
      department: 'AI & Data Science',
      yearSemester: '3rd Year',
      college: 'Engineering Institute',
      learningMode: 'Visual' as const,
      studyConsistency: 'High' as const,
      avgSessionMinutes: 25,
      learningStreakDays: 1,
    };
    state.studentProfiles.push(profile);

    updateTwinMastery(newId);
    db.save();

    res.json({ success: true, user: newUser, profile });
  });

  app.post('/api/auth/onboarding', (req, res) => {
    const { name, department, yearSemester, college, learningMode, goals, avatarUrl } = req.body;
    const state = db.getState();

    const user = state.users.find((u) => u.id === currentUserId);
    if (user && name) user.name = name;
    if (user && typeof avatarUrl === 'string') user.avatarUrl = avatarUrl || undefined;

    const profile = state.studentProfiles.find((p) => p.userId === currentUserId);
    if (profile) {
      if (department) profile.department = department;
      if (yearSemester) profile.yearSemester = yearSemester;
      if (college) profile.college = college;
      if (learningMode) profile.learningMode = learningMode;
    }

    if (goals && goals.length > 0) {
      const goal = state.learningGoals.find((g) => g.studentId === currentUserId);
      if (goal) {
        goal.title = goals;
      }
    }

    db.save();
    res.json({ success: true, user, profile });
  });

  // =================== CONCEPTS & GRAPH API ===================
  app.get('/api/concepts', (req, res) => {
    const state = db.getState();
    const subjectId = (req.query.subjectId as string) || 'sub_ml';
    const concepts = state.concepts.filter((c) => !subjectId || c.subjectId === subjectId);
    res.json(concepts);
  });

  app.get('/api/concepts/:id', (req, res) => {
    const state = db.getState();
    const concept = state.concepts.find((c) => c.id === req.params.id);
    if (!concept) {
      return res.status(404).json({ error: 'Concept not found' });
    }
    const prereqs = state.prerequisites.filter((p) => p.conceptId === concept.id);
    res.json({ concept, prerequisites: prereqs });
  });

  // =================== LEARNER STATE & TWIN ===================
  app.get('/api/learning-twin', (req, res) => {
    const studentId = currentUserId;
    const twin = updateTwinMastery(studentId);
    const profile = db.getStudentProfile(studentId);
    const retentionData = calculateRetentionHealth(studentId);
    const gaps = detectKnowledgeGaps(studentId);
    const currentDecision = evaluateNextAction({ studentId });

    res.json({
      twin,
      profile,
      retentionHealth: retentionData.overallRetentionHealth,
      activeGapsCount: gaps.length,
      currentDecision,
    });
  });

  app.get('/api/learning-twin/concepts', (req, res) => {
    const studentId = currentUserId;
    const state = db.getState();
    const twinConcepts = state.learningTwinConcepts.filter((c) => c.studentId === studentId);
    const concepts = state.concepts.map((c) => {
      const tc = twinConcepts.find((item) => item.conceptId === c.id);
      return {
        ...c,
        masteryScore: tc ? tc.masteryScore : 0,
        uncertainty: tc ? tc.uncertainty : 'High',
        status: tc ? tc.status : 'Not Learned',
        confidenceLevel: tc ? tc.confidenceLevel : 0,
        attemptsCount: tc ? tc.attemptsCount : 0,
        forgettingRisk: tc ? tc.forgettingRisk : 'Low',
        transferScore: tc ? tc.transferScore : 50,
      };
    });
    res.json(concepts);
  });

  app.get('/api/learner/:studentId/state', (req, res) => {
    const studentId = req.params.studentId || currentUserId;
    const state = db.getState();
    const twin = updateTwinMastery(studentId);
    const concepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);
    const gaps = detectKnowledgeGaps(studentId);
    const retention = calculateRetentionHealth(studentId);
    const decision = evaluateNextAction({ studentId });

    res.json({
      studentId,
      overallTwin: twin,
      concepts,
      knowledgeGaps: gaps,
      retentionHealth: retention.overallRetentionHealth,
      currentDecision: decision,
    });
  });

  app.get('/api/learner/:studentId/evidence', (req, res) => {
    const studentId = req.params.studentId || currentUserId;
    const conceptId = req.query.conceptId as string;
    const evidences = getStudentEvidence(studentId, conceptId);
    res.json(evidences);
  });

  app.get('/api/learner/:studentId/decisions', (req, res) => {
    const studentId = req.params.studentId || currentUserId;
    const state = db.getState();
    const records = (state.decisionRecords || []).filter((d) => d.studentId === studentId);
    res.json(records);
  });

  // =================== KNOWLEDGE GRAPH ===================
  app.get('/api/knowledge-graph', (req, res) => {
    const studentId = currentUserId;
    const subjectId = (req.query.subjectId as string) || 'sub_ml';
    const state = db.getState();

    const concepts = state.concepts.filter((c) => c.subjectId === subjectId);
    const twinConcepts = state.learningTwinConcepts.filter((tc) => tc.studentId === studentId);
    const gaps = state.knowledgeGaps.filter((g) => g.studentId === studentId && g.status !== 'RESOLVED');

    const nodes = concepts.map((c) => {
      const tc = twinConcepts.find((item) => item.conceptId === c.id);
      const isGap = gaps.some((g) => g.conceptId === c.id);

      let status = tc ? tc.status : 'Not Learned';
      if (isGap) status = 'Gap';

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        difficulty: c.difficulty,
        topicId: c.topicId,
        parentConceptId: c.parentConceptId,
        masteryScore: tc ? tc.masteryScore : 0,
        uncertainty: tc ? tc.uncertainty : 'High',
        status,
      };
    });

    const edges = state.prerequisites
      .filter((p) => concepts.some((c) => c.id === p.conceptId) && concepts.some((c) => c.id === p.prerequisiteConceptId))
      .map((p) => ({
        id: p.id,
        source: p.prerequisiteConceptId,
        target: p.conceptId,
        type: p.relationshipType,
      }));

    res.json({
      subjectId,
      nodes,
      edges,
      subjects: state.subjects,
    });
  });

  // =================== KNOWLEDGE GAPS ===================
  app.get('/api/knowledge-gaps', (req, res) => {
    const studentId = currentUserId;
    const gaps = detectKnowledgeGaps(studentId);
    res.json(gaps);
  });

  // =================== ADAPTIVE LEARNING PATH ===================
  app.get('/api/learning-path', (req, res) => {
    const studentId = currentUserId;
    const path = generateAdaptiveLearningPath(studentId, 'sub_ml');
    res.json(path);
  });

  // =================== RETENTION & REVISION ===================
  app.get('/api/retention', (req, res) => {
    const studentId = currentUserId;
    const data = calculateRetentionHealth(studentId);
    const schedule = (data.records || []).map((r) => ({
      conceptId: r.conceptId,
      conceptName: r.conceptName,
      retentionStatus: r.status,
      predictedRetentionScore: r.masteryScore,
      daysSincePractice: r.daysSincePractice,
      recommendedReviewDate: r.nextScheduledReview,
    }));
    res.json({
      ...data,
      schedule,
    });
  });

  app.post('/api/retention/practice', (req, res) => {
    const { conceptId } = req.body;
    const studentId = currentUserId;
    recordPracticeSession(studentId, conceptId);
    const data = calculateRetentionHealth(studentId);
    const schedule = (data.records || []).map((r) => ({
      conceptId: r.conceptId,
      conceptName: r.conceptName,
      retentionStatus: r.status,
      predictedRetentionScore: r.masteryScore,
      daysSincePractice: r.daysSincePractice,
      recommendedReviewDate: r.nextScheduledReview,
    }));
    res.json({ success: true, ...data, schedule });
  });

  // =================== CORE ATTEMPT PIPELINE ===================
  // POST /api/attempts: Process evidence -> Anti-Gaming -> Update Mastery -> Uncertainty -> Prereq -> Gaps -> Decision Engine
  app.post('/api/attempts', (req, res) => {
    const {
      studentId = currentUserId,
      conceptId,
      questionId,
      selectedOption,
      confidence,
      responseTimeMs,
      hintsUsed,
      sessionId,
      isRetry,
      isTransferQuestion,
    } = req.body;

    if (!conceptId || !questionId || selectedOption === undefined) {
      return res.status(400).json({ error: 'Missing required attempt fields' });
    }

    // 1. Record and validate AttemptEvidence with Anti-Gaming analysis
    const attemptResult = recordAttemptEvidence({
      studentId,
      conceptId,
      questionId,
      selectedOption,
      confidence,
      responseTimeMs,
      hintsUsed,
      sessionId,
      isRetry,
      isTransferQuestion,
    });

    // 2. Update Mastery and Uncertainty deterministically
    const masteryResult = updateConceptMasteryFromEvidence({
      studentId,
      conceptId,
      latestEvidence: attemptResult.evidence,
    });

    // 3. Update Knowledge Gaps & Retention
    detectKnowledgeGaps(studentId);
    calculateRetentionHealth(studentId);

    // 4. Run Explainable Next-Action Decision Engine
    const decision = evaluateNextAction({
      studentId,
      focusConceptId: conceptId,
      latestEvidence: attemptResult.evidence,
    });

    res.json({
      success: true,
      attemptEvidence: attemptResult.evidence,
      isCorrect: attemptResult.isCorrect,
      antiGaming: attemptResult.antiGaming,
      masteryUpdate: masteryResult,
      decision,
    });
  });

  // =================== COLD-START DIAGNOSTIC ===================
  app.post('/api/diagnostic/submit', (req, res) => {
    const { answers, confidenceMap, responseTimeMap, hintsMap } = req.body;
    const studentId = currentUserId;
    const state = db.getState();

    const diagnosticQuestions = state.questions.filter((q) => q.id.startsWith('q_diag_') || q.id === 'q1' || q.id === 'q2' || q.id === 'q3');
    const results: any[] = [];
    let correctCount = 0;

    diagnosticQuestions.forEach((q) => {
      const chosen = answers ? answers[q.id] : undefined;
      const conf = confidenceMap ? confidenceMap[q.id] : 'Medium';
      const respTime = responseTimeMap ? responseTimeMap[q.id] : 14000;
      const hints = hintsMap ? hintsMap[q.id] : 0;

      if (chosen !== undefined) {
        const att = recordAttemptEvidence({
          studentId,
          conceptId: q.conceptId,
          questionId: q.id,
          selectedOption: chosen,
          confidence: conf,
          responseTimeMs: respTime,
          hintsUsed: hints,
          questionType: 'DIAGNOSTIC',
        });

        if (att.isCorrect) correctCount += 1;

        updateConceptMasteryFromEvidence({
          studentId,
          conceptId: q.conceptId,
          latestEvidence: att.evidence,
        });

        results.push(att);
      }
    });

    detectKnowledgeGaps(studentId);
    calculateRetentionHealth(studentId);
    const updatedTwin = updateTwinMastery(studentId);

    // Generate initial explainable decision
    const firstDecision = evaluateNextAction({ studentId });

    res.json({
      success: true,
      totalQuestions: diagnosticQuestions.length,
      correctCount,
      overallMastery: updatedTwin.overallMastery,
      twin: updatedTwin,
      firstDecision,
    });
  });

  // =================== DECISION ENGINE ROUTES ===================
  app.get('/api/next-action/:studentId', (req, res) => {
    const studentId = req.params.studentId || currentUserId;
    const focusConceptId = req.query.conceptId as string;
    const decision = evaluateNextAction({ studentId, focusConceptId });
    res.json(decision);
  });

  app.get('/api/decision/:decisionId', (req, res) => {
    const state = db.getState();
    const decision = (state.decisionRecords || []).find((d) => d.id === req.params.decisionId);
    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }
    res.json(decision);
  });

  app.post('/api/decision/replay', (req, res) => {
    const { decisionId } = req.body;
    const replayed = replayDecision(decisionId);
    if (!replayed) {
      return res.status(404).json({ error: 'Could not replay decision' });
    }
    res.json({ success: true, replayedDecision: replayed });
  });

  // =================== TEACHER OVERRIDES & AUDIT ===================
  app.post('/api/teacher/override', (req, res) => {
    const { studentId, conceptId, originalAction, overriddenAction, reason, decisionId } = req.body;
    const override = createTeacherOverride({
      studentId: studentId || currentUserId,
      conceptId: conceptId || 'c_bayes',
      teacherId: 'usr_teacher_1',
      originalAction: originalAction || 'PRACTICE',
      overriddenAction: overriddenAction || 'ADVANCE',
      reason: reason || 'Instructor clinical verification in lab session.',
      decisionId,
    });

    const updatedDecision = evaluateNextAction({
      studentId: studentId || currentUserId,
      focusConceptId: conceptId || 'c_bayes',
    });

    res.json({ success: true, override, updatedDecision });
  });

  app.get('/api/teacher/overrides', (req, res) => {
    const studentId = req.query.studentId as string;
    const overrides = getTeacherOverrides(studentId);
    res.json(overrides);
  });

  app.delete('/api/teacher/override/:id', (req, res) => {
    const success = revokeTeacherOverride(req.params.id);
    res.json({ success });
  });

  app.get('/api/teacher/audit', (req, res) => {
    const state = db.getState();
    res.json({
      overrides: state.teacherOverrides || [],
      recentDecisions: (state.decisionRecords || []).slice(-30),
      interventions: state.interventions || [],
    });
  });

  // =================== TWO-LEARNER SIMULATION & STRESS TESTS ===================
  app.get('/api/simulation/two-learners', (req, res) => {
    const simResult = runTwoLearnerSimulation();
    res.json(simResult);
  });

  app.get('/api/simulation/stress-tests', (req, res) => {
    const testResults = runJudgeStressTests();
    const passedCount = testResults.filter((t) => t.passed).length;
    res.json({
      totalTests: testResults.length,
      passedCount,
      allPassed: passedCount === testResults.length,
      tests: testResults,
    });
  });

  // =================== ASSESSMENTS ===================
  app.get('/api/assessments', (req, res) => {
    const { subjectId, conceptId } = req.query;
    const state = db.getState();
    let list = state.assessments;
    if (subjectId) {
      list = list.filter((a) => a.subjectId === subjectId);
    }
    if (conceptId) {
      list = list.filter((a) => a.conceptId === conceptId || a.id.includes(conceptId as string));
    }
    res.json({ assessments: list, subjects: state.subjects });
  });

  app.get('/api/assessment/:id', (req, res) => {
    const { id } = req.params;
    const state = db.getState();
    let assessment = state.assessments.find((a) => a.id === id)
      || state.assessments.find((a) => a.conceptId === id)
      || state.assessments.find((a) => a.subjectId === id);
    if (!assessment) {
      assessment = state.assessments[0];
    }
    const questionsById = new Map(state.questions.map((q) => [q.id, q]));
    const questions = assessment.questionIds
      .map((qid) => questionsById.get(qid))
      .filter((q): q is (typeof state.questions)[number] => Boolean(q));
    res.json({ assessment, questions });
  });

  app.post('/api/assessment/submit', (req, res) => {
    const {
      assessmentId,
      answers = {},
      confidenceMap = {},
      responseTimeMsMap = {},
      hintsUsedMap = {},
    } = req.body;
    const studentId = currentUserId;
    const state = db.getState();

    let assessment = state.assessments.find((a) => a.id === assessmentId)
      || state.assessments.find((a) => a.conceptId === assessmentId)
      || state.assessments.find((a) => a.subjectId === assessmentId);
    if (!assessment) {
      assessment = state.assessments[0];
    }

    const questionsById = new Map(state.questions.map((q) => [q.id, q]));
    const questions = assessment.questionIds
      .map((qid) => questionsById.get(qid))
      .filter((q): q is (typeof state.questions)[number] => Boolean(q));

    let correctCount = 0;
    const breakdown: any[] = [];
    const modifiedConcepts = new Set<string>();

    questions.forEach((q) => {
      const chosen = answers ? answers[q.id] : undefined;
      const conf = confidenceMap ? confidenceMap[q.id] : 'Medium';
      const respTime = responseTimeMsMap ? responseTimeMsMap[q.id] : 14000;
      const hints = hintsUsedMap ? hintsUsedMap[q.id] : 0;

      if (chosen !== undefined) {
        const att = recordAttemptEvidence({
          studentId,
          conceptId: q.conceptId,
          questionId: q.id,
          selectedOption: chosen,
          confidence: conf,
          responseTimeMs: respTime,
          hintsUsed: hints,
          isTransferQuestion: q.isTransferQuestion,
        });

        if (att.isCorrect) correctCount += 1;
        modifiedConcepts.add(q.conceptId);

        updateConceptMasteryFromEvidence({
          studentId,
          conceptId: q.conceptId,
          latestEvidence: att.evidence,
        });

        breakdown.push({
          questionId: q.id,
          question: q.question,
          chosenOption: chosen || 'Not Answered',
          correctAnswer: q.correctAnswer,
          isCorrect: att.isCorrect,
          explanation: q.explanation,
          difficulty: q.difficulty,
          antiGaming: att.antiGaming,
        });
      }
    });

    const totalQ = questions.length || 1;
    const scorePercentage = Math.round((correctCount / totalQ) * 100);

    const attempt = {
      id: `att_${Date.now()}`,
      studentId,
      assessmentId: assessment.id,
      score: scorePercentage,
      totalQuestions: totalQ,
      correctAnswersCount: correctCount,
      answers,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'COMPLETED' as const,
    };
    state.assessmentAttempts.push(attempt);

    detectKnowledgeGaps(studentId);
    calculateRetentionHealth(studentId);
    const updatedTwin = updateTwinMastery(studentId);

    // Run Decision Engine
    const targetConceptId = Array.from(modifiedConcepts)[0] || assessment.conceptId;
    const decision = evaluateNextAction({
      studentId,
      focusConceptId: targetConceptId,
    });

    db.save();

    res.json({
      success: true,
      score: scorePercentage,
      correctCount,
      totalQuestions: totalQ,
      twin: updatedTwin,
      breakdown,
      decision,
    });
  });

  // =================== AI TUTOR ===================
  app.get('/api/tutor/history', (req, res) => {
    const studentId = currentUserId;
    const conceptId = (req.query.conceptId as string) || 'c_bayes';
    const state = db.getState();

    let conv = state.tutorConversations.find((c) => c.studentId === studentId && c.conceptId === conceptId);
    if (!conv) {
      const concept = state.concepts.find((c) => c.id === conceptId);
      conv = {
        id: `conv_${Date.now()}`,
        studentId,
        conceptId,
        conceptName: concept?.name || 'Bayes Theorem',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.tutorConversations.push(conv);
      db.save();
    }

    const messages = state.tutorMessages.filter((m) => m.conversationId === conv.id);
    res.json({ conversation: conv, messages });
  });

  app.post('/api/tutor/message', async (req, res) => {
    try {
      const { conceptId = 'c_bayes', message, action } = req.body;
      const studentId = currentUserId;
      const state = db.getState();

      let conv = state.tutorConversations.find((c) => c.studentId === studentId && c.conceptId === conceptId);
      if (!conv) {
        const concept = state.concepts.find((c) => c.id === conceptId);
        conv = {
          id: `conv_${Date.now()}`,
          studentId,
          conceptId,
          conceptName: concept?.name || 'Bayes Theorem',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.tutorConversations.push(conv);
      }

      const userMsg = {
        id: `msg_${Date.now()}_u`,
        conversationId: conv.id,
        sender: 'USER' as const,
        content: typeof message === 'string' ? message : '',
        actionUsed: action,
        timestamp: new Date().toISOString(),
      };
      state.tutorMessages.push(userMsg);

      // Call server-side Gemini tutor
      const replyText = await generateTutorResponse({
        studentId,
        conceptId,
        userMessage: userMsg.content,
        action,
        history: state.tutorMessages.filter((m) => m.conversationId === conv.id),
      });

      const tutorMsg = {
        id: `msg_${Date.now()}_t`,
        conversationId: conv.id,
        sender: 'TUTOR' as const,
        content: replyText,
        actionUsed: action,
        timestamp: new Date().toISOString(),
      };
      state.tutorMessages.push(tutorMsg);
      conv.updatedAt = new Date().toISOString();
      db.save();

      res.json({ userMessage: userMsg, tutorMessage: tutorMsg });
    } catch (err) {
      console.error('POST /api/tutor/message failed:', err);
      res.status(200).json({
        tutorMessage: {
          id: `msg_${Date.now()}_t`,
          conversationId: 'active',
          sender: 'TUTOR' as const,
          content:
            "I'm here to support your mastery of this concept. Let's break down the underlying prerequisites step by step.",
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // =================== TEACHER ROUTES ===================
  app.get('/api/teacher/dashboard', (req, res) => {
    const cohortAnalytics = getLiveCohortAnalytics();
    res.json(cohortAnalytics);
  });

  app.get('/api/teacher/students', (req, res) => {
    const state = db.getState();
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    ];
    const formatted = state.teacherStudents.map((ts, idx) => {
      const dec = evaluateNextAction({ studentId: ts.studentId });
      return {
        ...ts,
        gaps: ts.knowledgeGaps || [],
        momentum: ts.learningMomentum || 12,
        avatarUrl: avatars[idx % avatars.length],
        currentDecision: dec,
      };
    });
    res.json(formatted);
  });

  app.get('/api/teacher/knowledge-gaps', (req, res) => {
    res.json([
      { topic: 'Probability', low: 18, medium: 45, high: 37, alert: 'Prerequisite bottle-neck detected' },
      { topic: 'Conditional Probability', low: 44, medium: 36, high: 20, alert: 'Prerequisite gap impacting Bayes Theorem' },
      { topic: 'Bayes Theorem', low: 42, medium: 38, high: 20, alert: 'Bottlenecked at conditional likelihood step' },
      { topic: 'Hypothesis Testing', low: 35, medium: 40, high: 25, alert: 'High error rate on p-values' },
      { topic: 'Linear Regression', low: 10, medium: 30, high: 60, alert: 'Good overall mastery' },
      { topic: 'Classification', low: 18, medium: 52, high: 30, alert: 'Moderate progression' },
    ]);
  });

  app.get('/api/teacher/analytics', (req, res) => {
    const cohort = getLiveCohortAnalytics();
    res.json({
      engagement: 84,
      assignmentCompletion: 78,
      classAverage: cohort.avgMastery,
      weeklyActivity: [
        { day: 'Mon', active: 38 },
        { day: 'Tue', active: 44 },
        { day: 'Wed', active: 41 },
        { day: 'Thu', active: 46 },
        { day: 'Fri', active: 39 },
        { day: 'Sat', active: 28 },
        { day: 'Sun', active: 34 },
      ],
    });
  });

  app.get('/api/teacher/interventions', (req, res) => {
    const state = db.getState();
    const normalized = (state.interventions || []).map((item: any) => {
      const affectedStudents = Array.isArray(item.affectedStudents) && item.affectedStudents.length > 0
        ? item.affectedStudents
        : (item.studentName ? [item.studentName] : ['Siva', 'Priya', 'Karthik', 'Rahul']);
      return {
        ...item,
        concept: item.concept || item.topicName || 'Foundational Concept',
        groupName: item.groupName || `${item.topicName || item.concept || 'Cohort'} Remediation Cohort`,
        severity: item.severity || (item.affectedCount && item.affectedCount >= 8 ? 'HIGH' : 'MEDIUM'),
        affectedStudents,
        affectedCount: item.affectedCount || affectedStudents.length,
        reason: item.reason || item.issue || 'Knowledge gap detected across student twins.',
        issue: item.issue || item.reason || 'Knowledge gap detected across student twins.',
        suggestedAction: item.suggestedAction || 'Deploy adaptive booster micro-set.',
        status: item.status || 'Pending',
        createdAt: item.createdAt || new Date().toISOString(),
      };
    });
    res.json(normalized);
  });

  app.post('/api/teacher/interventions', (req, res) => {
    const { id, status } = req.body;
    const state = db.getState();
    const item = state.interventions.find((i) => i.id === id);
    if (item) item.status = status;
    db.save();
    res.json({ success: true, intervention: item });
  });

  // =================== PROGRESS & ANALYTICS ===================
  app.get('/api/progress', (req, res) => {
    const studentId = currentUserId;
    const twin = updateTwinMastery(studentId);
    const state = db.getState();

    const masteryTrend = [
      { day: 'Day 1', mastery: 42 },
      { day: 'Day 3', mastery: 50 },
      { day: 'Day 6', mastery: 58 },
      { day: 'Day 8', mastery: 64 },
      { day: 'Day 10', mastery: 68 },
      { day: 'Day 12 (Today)', mastery: twin.overallMastery },
    ];

    const subjectProgress = state.subjects.map((sub) => ({
      name: sub.name,
      mastery: twin.subjectMastery[sub.id] || 60,
      color: sub.color,
    }));

    res.json({
      overallMastery: twin.overallMastery,
      learningHours: twin.totalStudyHours,
      conceptsMastered: twin.conceptsMasteredCount,
      assessmentsCount: twin.assessmentsCompletedCount,
      avgScore: twin.avgAssessmentScore,
      masteryTrend,
      subjectProgress,
    });
  });

  // =================== GOALS & NOTIFICATIONS ===================
  app.get('/api/goals', (req, res) => {
    const studentId = currentUserId;
    const goals = db.getGoals(studentId);
    res.json(goals);
  });

  app.post('/api/goals', (req, res) => {
    const { title, targetDate, milestones } = req.body;
    const studentId = currentUserId;
    const state = db.getState();
    const newGoal = {
      id: `goal_${Date.now()}`,
      studentId,
      title: title || 'New AI Milestone',
      targetDate: targetDate || '2026-11-30',
      overallProgress: 0,
      milestones: milestones || [
        { id: 'm_1', skill: 'Foundational Knowledge', progress: 0, status: 'In Progress' as const },
      ],
    };
    state.learningGoals.push(newGoal);
    db.save();
    res.json({ success: true, goal: newGoal });
  });

  app.get('/api/notifications', (req, res) => {
    const studentId = currentUserId;
    const notifs = db.getNotifications(studentId);
    res.json(notifs);
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { id } = req.body;
    const state = db.getState();
    const notif = state.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    db.save();
    res.json({ success: true });
  });

  // =================== DEMO & RESET HELPERS ===================
  app.post('/api/demo/trigger-gap', (req, res) => {
    const studentId = currentUserId;
    const state = db.getState();

    const cCond = state.learningTwinConcepts.find((c) => c.studentId === studentId && c.conceptId === 'c_cond_prob');
    if (cCond) {
      cCond.masteryScore = 45;
      cCond.uncertainty = 'Medium';
      cCond.status = 'Gap';
    }
    const cBayes = state.learningTwinConcepts.find((c) => c.studentId === studentId && c.conceptId === 'c_bayes');
    if (cBayes) {
      cBayes.masteryScore = 38;
      cBayes.uncertainty = 'Medium';
      cBayes.status = 'Gap';
    }

    detectKnowledgeGaps(studentId);
    updateTwinMastery(studentId);
    const dec = evaluateNextAction({ studentId, focusConceptId: 'c_bayes' });
    db.save();

    res.json({
      success: true,
      message: 'Seeded gap scenario activated: Bayes Theorem gap with Conditional Probability prerequisite bottleneck.',
      decision: dec,
    });
  });

  app.post('/api/demo/resolve-gap', (req, res) => {
    const studentId = currentUserId;
    const state = db.getState();

    const cCond = state.learningTwinConcepts.find((c) => c.studentId === studentId && c.conceptId === 'c_cond_prob');
    if (cCond) {
      cCond.masteryScore = 88;
      cCond.uncertainty = 'Low';
      cCond.status = 'Mastered';
    }

    const cBayes = state.learningTwinConcepts.find((c) => c.studentId === studentId && c.conceptId === 'c_bayes');
    if (cBayes) {
      cBayes.masteryScore = 82;
      cBayes.uncertainty = 'Low';
      cBayes.status = 'Mastered';
    }

    state.knowledgeGaps
      .filter((g) => g.studentId === studentId && (g.conceptId === 'c_bayes' || g.conceptId === 'c_cond_prob'))
      .forEach((g) => {
        g.status = 'RESOLVED';
        g.resolvedAt = new Date().toISOString();
      });

    updateTwinMastery(studentId);
    const dec = evaluateNextAction({ studentId });
    db.save();

    res.json({
      success: true,
      message: 'Gap resolved! Prerequisite mastered and Learning Twin updated.',
      decision: dec,
    });
  });

  app.post('/api/demo/reset', (req, res) => {
    const seed = db.resetToSeed();
    currentUserId = 'usr_student_1';
    res.json({ success: true, state: seed });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(`Unhandled error on ${req.method} ${req.path}:`, err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(200).json({
      error: 'internal_error',
      message: 'Something went wrong processing that request. Please try again.',
    });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZONE Decision Engine Server running on port ${PORT}`);
  });
}

startServer();