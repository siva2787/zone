import React from 'react';
import {
  TrendingUp,
  Flame,
  HeartPulse,
  AlertOctagon,
  ArrowRight,
  BookOpen,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { LearningTwin, KnowledgeGap } from '../../types.ts';

interface DashboardViewProps {
  twin: LearningTwin | null;
  studentName?: string;
  gaps: KnowledgeGap[];
  onStartRecommendedLearning: () => void;
  onNavigateTwin: () => void;
  onNavigateGraph: () => void;
  onNavigateTutor: (params?: any) => void;
  onNavigatePath: () => void;
  onNavigateAssessments: (cId?: any) => void;
  onNavigateRetention: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  twin,
  studentName = 'Siva',
  gaps,
  onStartRecommendedLearning,
  onNavigateTwin,
  onNavigateGraph,
  onNavigateTutor,
  onNavigatePath,
  onNavigateAssessments,
  onNavigateRetention,
}) => {
  const overallMastery = twin?.overallMastery ?? 72;
  const momentum = twin?.learningMomentum ?? 12;
  const retentionHealth = twin?.retentionHealth ?? 81;
  const safeGaps = Array.isArray(gaps) ? gaps : [];
  const activeGapsCount = safeGaps.length > 0 ? safeGaps.length : 3;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Greeting Header from Reference Screen 6 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, {studentName}!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's your learning overview for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateTwin}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>My Learning Twin</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards (Screen 6 from Reference) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Mastery */}
        <div
          onClick={onNavigateTwin}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500">Overall Mastery</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{overallMastery}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />+{momentum}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              style={{ width: `${overallMastery}%` }}
            />
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Learning Streak</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">12</span>
            <span className="text-sm font-semibold text-slate-500">days</span>
            <Flame className="w-5 h-5 text-amber-500 ml-auto" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Consistent daily revision</p>
        </div>

        {/* Retention Health */}
        <div
          onClick={onNavigateRetention}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500">Retention Health</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{retentionHealth}%</span>
            <HeartPulse className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${retentionHealth}%` }}
            />
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div
          onClick={onNavigateGraph}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500">Knowledge Gaps</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-600">{activeGapsCount}</span>
            <span className="text-xs font-semibold text-rose-500">Topics</span>
            <AlertOctagon className="w-5 h-5 text-rose-500 ml-auto" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Prioritized by prerequisite impact</p>
        </div>
      </div>

      {/* Today's Recommendation Banner (Screen 6 from Reference) */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Today's Recommendation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bayes Theorem
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Because your twin detected a gap in{' '}
            <strong className="text-white font-semibold underline decoration-indigo-400">
              Conditional Probability
            </strong>
            . Resolving this will unlock Naive Bayes and Classification.
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs text-indigo-300 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 15 min
            </span>
            <span>•</span>
            <span>Prerequisite Backtracking Active</span>
          </div>
        </div>

        <button
          onClick={onStartRecommendedLearning}
          className="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 whitespace-nowrap hover:scale-105"
        >
          <span>Start Learning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Continue Learning Subjects (Screen 6 from Reference) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Continue Learning
          </h2>
          <button
            onClick={onNavigatePath}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            View Adaptive Path →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Machine Learning', mastery: twin?.subjectMastery?.sub_ml ?? 64, color: 'from-indigo-500 to-indigo-600' },
            { name: 'Statistics & Probability', mastery: twin?.subjectMastery?.sub_stat ?? 48, color: 'from-pink-500 to-pink-600' },
            { name: 'Python for AI', mastery: twin?.subjectMastery?.sub_py ?? 82, color: 'from-emerald-500 to-emerald-600' },
          ].map((sub, idx) => (
            <div
              key={idx}
              onClick={onNavigatePath}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-2 flex-1 mr-4">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{sub.name}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${sub.color} rounded-full`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
              </div>
              <div className="text-lg font-extrabold text-slate-900">{sub.mastery}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Knowledge Gaps Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-900">
              Active Knowledge Gaps Detected by Twin
            </h2>
          </div>
          <button
            onClick={onNavigateGraph}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Explore in Knowledge Graph →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {safeGaps.slice(0, 2).map((gap) => (
            <div
              key={gap.id}
              className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{gap.conceptName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Mastery: {gap.masteryScore}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {gap.reason}
                </p>
                {gap.missingPrerequisiteName && (
                  <div className="mt-2 text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                    <span>Missing Prerequisite:</span>
                    <span className="underline">{gap.missingPrerequisiteName}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  onNavigateTutor({
                    conceptId: gap.conceptId,
                    conceptName: gap.conceptName,
                    masteryScore: gap.masteryScore,
                    detectedGap: gap.reason,
                    initialPrompt: `How can I resolve my knowledge gap in ${gap.conceptName} (${gap.masteryScore}%)?`,
                  })
                }
                className="w-full py-1.5 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold rounded-xl transition-colors text-center"
              >
                Ask AI Tutor to Fix Gap →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};