import React, { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  AlertOctagon,
  UserCheck,
  ArrowRight,
  BookOpen,
  Sparkles,
  GitFork,
  BarChart3,
} from 'lucide-react';

interface TeacherDashboardViewProps {
  onNavigateClassTwins: () => void;
  onNavigateGapAnalytics: () => void;
  onNavigateInterventions: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  onNavigateClassTwins,
  onNavigateGapAnalytics,
  onNavigateInterventions,
}) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/teacher/dashboard')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header from Screen 17 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Analytics & Cohort Monitoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Cohort: AI & Data Science (Batch 2026) • Real-time twin aggregated insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateInterventions}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>4 Pending Interventions</span>
          </button>
        </div>
      </div>

      {/* 4 Class Metric Cards (Screen 17 from Reference) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={onNavigateClassTwins}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500">Total Students</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{data?.totalStudents ?? 48}</span>
            <Users className="w-5 h-5 text-indigo-500 ml-auto" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Class cohort enrolled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Class Average Mastery</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{data?.avgMastery ?? 68}%</span>
            <TrendingUp className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${data?.avgMastery ?? 68}%` }}
            />
          </div>
        </div>

        <div
          onClick={onNavigateInterventions}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="text-xs font-semibold text-slate-500">At-Risk Learners</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-600">{data?.atRiskCount ?? 12}</span>
            <AlertOctagon className="w-5 h-5 text-rose-500 ml-auto" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Mastery &lt; 60% or bottlenecked</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Active Today</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600">{data?.activeToday ?? 36}</span>
            <span className="text-xs text-slate-400">/ 48</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">75% daily engagement rate</p>
        </div>
      </div>

      {/* Class Subject Mastery Breakdown (Screen 17 from Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Class Mastery by Subject</h2>
              <p className="text-xs text-slate-500">Aggregated twin performance across academic modules</p>
            </div>
            <button
              onClick={onNavigateGapAnalytics}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Topic Heatmap</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { subject: 'Machine Learning Foundations', mastery: 76, color: 'bg-indigo-600' },
              { subject: 'Statistics & Probability', mastery: 61, color: 'bg-amber-500' },
              { subject: 'Data Science & Python', mastery: 82, color: 'bg-emerald-500' },
              { subject: 'Operating Systems & Concurrency', mastery: 54, color: 'bg-rose-500' },
            ].map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{sub.subject}</span>
                  <span className="text-slate-900 font-extrabold">{sub.mastery}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${sub.color} rounded-full`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Action Callouts */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-950 p-6 rounded-3xl text-white shadow-md space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Prerequisite Bottleneck Alert</span>
            </div>

            <h3 className="text-base font-bold leading-snug">
              Class-Wide Bottleneck: Conditional Probability
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              42% of students are encountering blockage in Bayes Theorem due to prerequisite gaps in joint and conditional probability.
            </p>

            <button
              onClick={onNavigateInterventions}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
            >
              Assign Cohort Remediation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
