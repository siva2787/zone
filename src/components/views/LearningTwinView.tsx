import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  TrendingUp,
  HeartPulse,
  Award,
  Zap,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { LearningTwin, StudentProfile, LearningTwinConcept, User } from '../../types.ts';

interface LearningTwinViewProps {
  twin: LearningTwin | null;
  profile: StudentProfile | null;
  twinConcepts: LearningTwinConcept[];
  user?: User | null;
  onNavigateTutor: (conceptId?: string) => void;
  onNavigateGraph: () => void;
  onNavigateRetention: () => void;
}

export const LearningTwinView: React.FC<LearningTwinViewProps> = ({
  twin,
  profile,
  twinConcepts,
  user,
  onNavigateTutor,
  onNavigateGraph,
  onNavigateRetention,
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Knowledge' | 'Behavior' | 'Retention' | 'Goals'>('Overview');

  const overallMastery = twin?.overallMastery ?? 72;
  const learningMomentum = twin?.learningMomentum ?? 12;
  const retentionHealth = twin?.retentionHealth ?? 81;

  const subjectStrengths = [
    { name: 'Python for AI', mastery: twin?.subjectMastery?.sub_py ?? 82, color: 'bg-emerald-500' },
    { name: 'Machine Learning', mastery: twin?.subjectMastery?.sub_ml ?? 64, color: 'bg-indigo-600' },
    { name: 'Statistics & Probability', mastery: twin?.subjectMastery?.sub_stat ?? 48, color: 'bg-pink-500' },
    { name: 'Data Structures', mastery: twin?.subjectMastery?.sub_ds ?? 71, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Header from Screen 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Learner Model</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Learning Twin
          </h1>
          <p className="text-xs text-slate-500">
            A dynamic mathematical representation of what you understand and how you retain.
          </p>
        </div>

        {/* Tab Navigation (Overview, Knowledge, Behavior, Retention, Goals) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['Overview', 'Knowledge', 'Behavior', 'Retention', 'Goals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${activeTab === tab
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid (Screen 7 from Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Knowledge Profile & Subject Strengths */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cognitive Snapshot
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Knowledge Profile</h2>
              <p className="text-xs text-slate-500">Subject mastery computed from actual assessments</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold text-slate-700">Subject Strengths</div>

              {subjectStrengths.map((sub, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{sub.name}</span>
                    <span className="text-slate-900 font-bold">{sub.mastery}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full transition-all duration-500`}
                      style={{ width: `${sub.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Overall Mastery Average:</span>
              <span className="text-sm font-extrabold text-indigo-700">{overallMastery}%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Learning Momentum</span>
            </div>
            <div className="text-2xl font-extrabold text-indigo-950">+{learningMomentum}%</div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Accelerating learning velocity across the past 7 days of practice.
            </p>
          </div>
        </div>

        {/* Center Column: Student Avatar & Twin Hologram (Screen 7 from Reference) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center justify-between min-h-[460px]">
          <div className="w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span>{user?.name || 'Siva'}'s Active Twin Model</span>
            </div>

            <div className="relative my-4 inline-block">
              <div className="w-44 h-44 rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-8 ring-indigo-500/10">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={`${user?.name || 'Student'} Twin`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Hologram Badges */}
              <div className="absolute -bottom-2 -left-4 bg-white px-3 py-1 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Active Sync</span>
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-2">{user?.name || 'Siva'}</h3>
            <p className="text-xs text-slate-500">{profile?.department || 'AI & Data Science'} • {profile?.yearSemester || '3rd Year'}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 italic">
              "Know Yourself, Learn Better."
            </p>
            <button
              onClick={onNavigateGraph}
              className="mt-3 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Explore In Knowledge Graph →
            </button>
          </div>
        </div>

        {/* Right Column: Learning Behavior & Retention (Screen 7 from Reference) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Learning Behavior Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cognitive Habits
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Learning Behavior</h2>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Study Consistency</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {profile?.studyConsistency || 'High'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Preferred Mode</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                  {profile?.learningMode || 'Visual'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Avg. Session</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                  {profile?.avgSessionMinutes || 28} min
                </span>
              </div>
            </div>
          </div>

          {/* Retention Health Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Memory Decay Model
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Retention Health</h2>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-3xl font-extrabold text-emerald-600 flex items-center gap-2">
                  <span>{retentionHealth}%</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">Healthy Curve</span>
              </div>

              <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-600 font-extrabold text-sm">
                <HeartPulse className="w-6 h-6" />
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Based on the Ebbinghaus stability algorithm. 1 concept currently flagged for revision.
            </p>

            <button
              onClick={onNavigateRetention}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Inspect Spaced Revision →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};