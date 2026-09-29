import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { LandingView } from './components/views/LandingView.tsx';
import { LoginView } from './components/views/LoginView.tsx';
import { RegisterView } from './components/views/RegisterView.tsx';
import { OnboardingView } from './components/views/OnboardingView.tsx';
import { DiagnosticAssessmentView } from './components/views/DiagnosticAssessmentView.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { LearningTwinView } from './components/views/LearningTwinView.tsx';
import { KnowledgeGraphView } from './components/views/KnowledgeGraphView.tsx';
import { KnowledgeGapExplorerView } from './components/views/KnowledgeGapExplorerView.tsx';
import { AITutorView } from './components/views/AITutorView.tsx';
import { AdaptiveLearningPathView } from './components/views/AdaptiveLearningPathView.tsx';
import { AdaptiveAssessmentView } from './components/views/AdaptiveAssessmentView.tsx';
import { RetentionRevisionView } from './components/views/RetentionRevisionView.tsx';
import { ProgressAnalyticsView } from './components/views/ProgressAnalyticsView.tsx';
import { LearningGoalsView } from './components/views/LearningGoalsView.tsx';
import { NotificationsView } from './components/views/NotificationsView.tsx';
import { TeacherDashboardView } from './components/views/TeacherDashboardView.tsx';
import { ClassLearningTwinsView } from './components/views/ClassLearningTwinsView.tsx';
import { StudentInsightsView } from './components/views/StudentInsightsView.tsx';
import { KnowledgeGapAnalyticsView } from './components/views/KnowledgeGapAnalyticsView.tsx';
import { InterventionCenterView } from './components/views/InterventionCenterView.tsx';
import { TeacherAnalyticsView } from './components/views/TeacherAnalyticsView.tsx';
import { ProfileSettingsView } from './components/views/ProfileSettingsView.tsx';
import { User, StudentProfile, LearningTwin, KnowledgeGap, AdaptiveLearningPath, LearningTwinConcept, TeacherStudentItem } from './types.ts';

export default function App() {
  const SCREEN_STORAGE_KEY = 'learntwin_current_screen';
  const [currentScreen, setCurrentScreenRaw] = useState<string>(() => {
    try {
      return localStorage.getItem(SCREEN_STORAGE_KEY) || 'landing';
    } catch {
      return 'landing';
    }
  });
  const setCurrentScreen = (screen: string) => {
    setCurrentScreenRaw(screen);
    try {
      localStorage.setItem(SCREEN_STORAGE_KEY, screen);
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  };
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [twin, setTwin] = useState<LearningTwin | null>(null);
  const [twinConcepts, setTwinConcepts] = useState<LearningTwinConcept[]>([]);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGap[]>([]);
  const [learningPath, setLearningPath] = useState<AdaptiveLearningPath | null>(null);
  const [selectedStudentForInsight, setSelectedStudentForInsight] = useState<TeacherStudentItem | null>(null);
  const [activeTutorConcept, setActiveTutorConcept] = useState<{
    id: string;
    name: string;
    mastery: number;
    gap: string;
    initialPrompt?: string;
  }>({
    id: 'c_bayes',
    name: 'Bayes Theorem',
    mastery: 38,
    gap: 'Weak prerequisite in Conditional Probability P(A|B)',
    initialPrompt: 'Can you explain Bayes Theorem and how Conditional Probability connects to it?',
  });

  const [activeAssessmentId, setActiveAssessmentId] = useState<string>('asmt_diag');

  const handleOpenAssessment = (idOrConceptId?: string) => {
    if (typeof idOrConceptId === 'string' && idOrConceptId.trim()) {
      setActiveAssessmentId(idOrConceptId);
    } else if (typeof idOrConceptId === 'object' && (idOrConceptId as any)?.conceptId) {
      setActiveAssessmentId((idOrConceptId as any).conceptId);
    }
    setCurrentScreen('assessments');
  };

  // Fetch current user and twin data on boot
  const loadInitialData = async () => {
    try {
      const authRes = await fetch('/api/auth/current-user');
      const authData = await authRes.json();
      if (authData.user) {
        setCurrentUser(authData.user);
        setStudentProfile(authData.profile);
      }

      const twinRes = await fetch('/api/learning-twin');
      const twinData = await twinRes.json();
      if (twinData.twin) {
        setTwin(twinData.twin);
      }

      const gapsRes = await fetch('/api/knowledge-gaps');
      const gapsData = await gapsRes.json();
      setKnowledgeGaps(Array.isArray(gapsData) ? gapsData : []);

      const pathRes = await fetch('/api/learning-path');
      const pathData = await pathRes.json();
      setLearningPath(pathData);

      const conceptsRes = await fetch('/api/learning-twin/concepts');
      const conceptsData = await conceptsRes.json();
      setTwinConcepts(Array.isArray(conceptsData) ? conceptsData : []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Switch role handler
  const handleSwitchRole = async (role: 'STUDENT' | 'TEACHER') => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (role === 'TEACHER') {
          setCurrentScreen('teacher-dashboard');
        } else {
          setCurrentScreen('dashboard');
        }
        loadInitialData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Demo Trigger: Bayes Theorem Gap
  const handleTriggerDemoGap = async () => {
    try {
      await fetch('/api/demo/trigger-gap', { method: 'POST' });
      await loadInitialData();
      setActiveTutorConcept({
        id: 'c_bayes',
        name: 'Bayes Theorem',
        mastery: 38,
        gap: 'Prerequisite gap in Conditional Probability (45%)',
      });
      setCurrentScreen('knowledge-gaps');
    } catch (err) {
      console.error(err);
    }
  };

  // Demo Resolve: Master Conditional Probability
  const handleResolveDemoGap = async () => {
    try {
      await fetch('/api/demo/resolve-gap', { method: 'POST' });
      await loadInitialData();
      setCurrentScreen('learning-twin');
    } catch (err) {
      console.error(err);
    }
  };

  // Demo Reset
  const handleResetDemo = async () => {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      await loadInitialData();
      setCurrentScreen('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  // User Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setStudentProfile(null);
    setCurrentScreen('landing');
  };

  const handleOpenTutorForConcept = (
    params?: string | { conceptId?: string; conceptName?: string; masteryScore?: number; detectedGap?: string; initialPrompt?: string },
    promptOverride?: string
  ) => {
    let id = 'c_bayes';
    let name = 'Bayes Theorem';
    let mastery = twinConcepts.find((c) => c.conceptId === 'c_bayes')?.masteryScore || 38;
    let gap = 'Weak prerequisite in Conditional Probability P(A|B)';
    let initialPrompt = promptOverride;

    if (typeof params === 'string') {
      id = params;
      if (id === 'c_cond_prob') {
        name = 'Conditional Probability';
        mastery = 45;
        gap = 'Needs reinforcement on joint vs conditional probabilities P(A ∩ B) / P(B)';
        initialPrompt = initialPrompt || 'I am struggling with Conditional Probability P(A|B). Can you explain how it differs from Joint Probability with a clear example?';
      } else if (id === 'c_bayes') {
        name = 'Bayes Theorem';
        mastery = twinConcepts.find((c) => c.conceptId === 'c_bayes')?.masteryScore || 38;
        gap = 'Prerequisite gap in Conditional Probability (45%)';
        initialPrompt = initialPrompt || 'Can you explain Bayes Theorem to me and help me resolve my prerequisite bottleneck in Conditional Probability?';
      } else if (id === 'c_prob') {
        name = 'Probability Foundations';
        mastery = 85;
        gap = 'None - Concept Mastered';
        initialPrompt = initialPrompt || 'Can you give me an advanced problem or real-world application of Probability Foundations to test my mastery?';
      } else if (id === 'c_rand_var') {
        name = 'Random Variables';
        mastery = 78;
        gap = 'Discrete vs Continuous distribution mapping';
        initialPrompt = initialPrompt || 'How do discrete random variables differ from continuous random variables, and how are probability mass and density functions defined?';
      } else if (id === 'c_dist') {
        name = 'Probability Distributions';
        mastery = 68;
        gap = 'Gaussian Normal distribution parameter tuning';
        initialPrompt = initialPrompt || 'Explain the Normal Gaussian Distribution and why the Central Limit Theorem makes it so crucial in machine learning.';
      } else if (id === 'c_naive_bayes') {
        name = 'Naive Bayes Classifier';
        mastery = 30;
        gap = 'Strong dependency on Bayes Theorem';
        initialPrompt = initialPrompt || 'How does Naive Bayes use Bayes Theorem for text classification, and why does it make the conditional independence assumption?';
      } else if (id === 'c_class') {
        name = 'Classification Metrics';
        mastery = 20;
        gap = 'Precision vs Recall trade-offs';
        initialPrompt = initialPrompt || 'Explain Precision, Recall, and ROC-AUC score. When should I prioritize Precision over Recall in an AI model?';
      } else if (id === 'c_eval') {
        name = 'Model Evaluation';
        mastery = 10;
        gap = 'Cross-validation strategies';
        initialPrompt = initialPrompt || 'How does K-Fold Cross Validation prevent overfitting, and how do I diagnose high bias vs high variance?';
      } else {
        initialPrompt = initialPrompt || `Guide me step-by-step through ${id} with clear analogies and practical examples.`;
      }
    } else if (typeof params === 'object' && params !== null) {
      id = params.conceptId || id;
      const conceptObj = twinConcepts.find((c) => c.conceptId === id);
      name = params.conceptName || (conceptObj as any)?.conceptName || (id === 'c_cond_prob' ? 'Conditional Probability' : id === 'c_bayes' ? 'Bayes Theorem' : name);
      mastery = params.masteryScore ?? conceptObj?.masteryScore ?? (id === 'c_cond_prob' ? 45 : 38);
      gap = params.detectedGap || (id === 'c_cond_prob' ? 'Needs reinforcement on joint vs conditional probabilities' : 'Prerequisite bottleneck in Conditional Probability');
      initialPrompt = params.initialPrompt || initialPrompt || `Explain ${name} step by step with clear analogies and practical examples.`;
    }

    setActiveTutorConcept({
      id,
      name,
      mastery,
      gap,
      initialPrompt,
    });
    setCurrentScreen('tutor');
  };

  const isFullScreenPage = ['landing', 'login', 'register', 'onboarding', 'diagnostic'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar: only shown for authenticated/in-app screens */}
      {!isFullScreenPage && (
        <Navbar
          user={currentUser}
          currentScreen={currentScreen}
          onNavigate={(s) => setCurrentScreen(s)}
          onSwitchRole={handleSwitchRole}
          onTriggerDemoGap={handleTriggerDemoGap}
          onResolveDemoGap={handleResolveDemoGap}
          onResetDemo={handleResetDemo}
          onLogout={handleLogout}
          unreadCount={2}
        />
      )}

      {/* Main Body Layout */}
      {isFullScreenPage ? (
        <main className="flex-1">
          {currentScreen === 'landing' && (
            <LandingView
              onGetStarted={async () => {
                if (!currentUser) {
                  await loadInitialData();
                }
                setCurrentScreen('onboarding');
              }}
              onExploreDashboard={async () => {
                if (!currentUser) {
                  await loadInitialData();
                }
                setCurrentScreen('dashboard');
              }}
              onLogin={() => setCurrentScreen('login')}
              onRegister={() => setCurrentScreen('register')}
            />
          )}

          {currentScreen === 'login' && (
            <LoginView
              onLoginSuccess={async (email) => {
                await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                });
                await loadInitialData();
                setCurrentScreen('dashboard');
              }}
              onNavigateRegister={() => setCurrentScreen('register')}
              onBackToLanding={() => setCurrentScreen('landing')}
              onDemoStudentLogin={async () => {
                await handleSwitchRole('STUDENT');
                setCurrentScreen('dashboard');
              }}
              onDemoTeacherLogin={async () => {
                await handleSwitchRole('TEACHER');
                setCurrentScreen('teacher-dashboard');
              }}
            />
          )}

          {currentScreen === 'register' && (
            <RegisterView
              onRegisterSuccess={async (data) => {
                await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                await loadInitialData();
                setCurrentScreen('onboarding');
              }}
              onNavigateLogin={() => setCurrentScreen('login')}
              onBackToLanding={() => setCurrentScreen('landing')}
            />
          )}

          {currentScreen === 'onboarding' && (
            <OnboardingView
              onCompleteOnboarding={async (data) => {
                await fetch('/api/auth/onboarding', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                await loadInitialData();
              }}
              onTakeDiagnostic={() => setCurrentScreen('diagnostic')}
              onBackToLanding={() => setCurrentScreen('landing')}
              onSkipToDashboard={() => setCurrentScreen('dashboard')}
            />
          )}

          {currentScreen === 'diagnostic' && (
            <DiagnosticAssessmentView
              onCompleteDiagnostic={async (score) => {
                await loadInitialData();
                setCurrentScreen('dashboard');
              }}
              onExit={() => setCurrentScreen('dashboard')}
            />
          )}
        </main>
      ) : (
        /* Authenticated App Shell with Sidebar */
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar
            currentScreen={currentScreen}
            role={currentUser?.role || 'STUDENT'}
            onNavigate={(s) => setCurrentScreen(s)}
            activeGapsCount={knowledgeGaps.length}
            unreadNotifications={2}
            onLogout={handleLogout}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {/* Student Screens */}
            {currentScreen === 'dashboard' && (
              <DashboardView
                twin={twin}
                studentName={currentUser?.name}
                gaps={knowledgeGaps}
                onStartRecommendedLearning={() => handleOpenTutorForConcept('c_bayes')}
                onNavigateTwin={() => setCurrentScreen('learning-twin')}
                onNavigateGraph={() => setCurrentScreen('knowledge-graph')}
                onNavigateTutor={(cId) => handleOpenTutorForConcept(cId)}
                onNavigatePath={() => setCurrentScreen('learning-path')}
                onNavigateAssessments={(cId) => handleOpenAssessment(cId)}
                onNavigateRetention={() => setCurrentScreen('retention')}
              />
            )}

            {currentScreen === 'learning-twin' && (
              <LearningTwinView
                twin={twin}
                profile={studentProfile}
                twinConcepts={twinConcepts}
                user={currentUser}
                onNavigateTutor={(cId) => handleOpenTutorForConcept(cId)}
                onNavigateGraph={() => setCurrentScreen('knowledge-graph')}
                onNavigateRetention={() => setCurrentScreen('retention')}
              />
            )}

            {currentScreen === 'knowledge-graph' && (
              <KnowledgeGraphView
                onSelectConcept={(cId) => handleOpenTutorForConcept(cId)}
                onNavigateTutor={(cId) => handleOpenTutorForConcept(cId)}
                onNavigateAssessment={(cId) => handleOpenAssessment(cId)}
              />
            )}

            {currentScreen === 'knowledge-gaps' && (
              <KnowledgeGapExplorerView
                gaps={knowledgeGaps}
                onFixGap={(cId) => handleOpenTutorForConcept(cId)}
                onNavigateGraph={() => setCurrentScreen('knowledge-graph')}
              />
            )}

            {currentScreen === 'tutor' && (
              <AITutorView
                key={`${activeTutorConcept.id}_${activeTutorConcept.initialPrompt || ''}`}
                conceptId={activeTutorConcept.id}
                conceptName={activeTutorConcept.name}
                masteryScore={activeTutorConcept.mastery}
                detectedGap={activeTutorConcept.gap}
                studentName={currentUser?.name || 'Siva'}
                initialPrompt={activeTutorConcept.initialPrompt}
              />
            )}

            {currentScreen === 'learning-path' && (
              <AdaptiveLearningPathView
                path={learningPath}
                onSelectConcept={(cId) => handleOpenTutorForConcept(cId)}
                onStartLesson={(cId) => handleOpenTutorForConcept(cId)}
              />
            )}

            {currentScreen === 'assessments' && (
              <AdaptiveAssessmentView
                key={activeAssessmentId}
                assessmentId={activeAssessmentId}
                onComplete={async () => {
                  await loadInitialData();
                  setCurrentScreen('dashboard');
                }}
                onNavigateTutor={(cId) => handleOpenTutorForConcept(cId)}
              />
            )}

            {currentScreen === 'retention' && (
              <RetentionRevisionView
                onPracticeConcept={(cId) => handleOpenTutorForConcept(cId)}
              />
            )}

            {currentScreen === 'progress' && <ProgressAnalyticsView />}

            {currentScreen === 'goals' && <LearningGoalsView />}

            {currentScreen === 'notifications' && <NotificationsView />}

            {/* Teacher Screens */}
            {currentScreen === 'teacher-dashboard' && (
              <TeacherDashboardView
                onNavigateClassTwins={() => setCurrentScreen('class-twins')}
                onNavigateGapAnalytics={() => setCurrentScreen('gap-analytics')}
                onNavigateInterventions={() => setCurrentScreen('interventions')}
              />
            )}

            {currentScreen === 'class-twins' && (
              <ClassLearningTwinsView
                onSelectStudent={(s) => {
                  setSelectedStudentForInsight(s);
                  setCurrentScreen('student-insights');
                }}
              />
            )}

            {currentScreen === 'student-insights' && (
              <StudentInsightsView
                student={selectedStudentForInsight}
                onBack={() => setCurrentScreen('class-twins')}
                onAssignIntervention={(name) => setCurrentScreen('interventions')}
              />
            )}

            {currentScreen === 'gap-analytics' && <KnowledgeGapAnalyticsView />}

            {currentScreen === 'interventions' && <InterventionCenterView />}

            {currentScreen === 'teacher-analytics' && <TeacherAnalyticsView />}

            {currentScreen === 'settings' && (
              <ProfileSettingsView
                user={currentUser}
                profile={studentProfile}
                onUpdateName={async (name) => {
                  await fetch('/api/auth/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                  });
                  await loadInitialData();
                }}
                onResetDatabase={handleResetDemo}
                onLogout={handleLogout}
                onUpdateAvatar={async (avatarUrl) => {
                  const res = await fetch('/api/auth/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ avatarUrl }),
                  });
                  if (!res.ok) throw new Error('Failed to save avatar');
                  await loadInitialData();
                }}
                onDeleteProfile={async () => {
                  await fetch('/api/auth/profile', { method: 'DELETE' });
                  await loadInitialData();
                  handleLogout();
                }}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}