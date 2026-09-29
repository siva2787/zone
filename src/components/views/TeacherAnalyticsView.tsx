import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const TeacherAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/teacher/analytics')
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err));
  }, []);

  const weekly = analytics?.weeklyActivity || [
    { day: 'Mon', active: 38 },
    { day: 'Tue', active: 44 },
    { day: 'Wed', active: 41 },
    { day: 'Thu', active: 46 },
    { day: 'Fri', active: 39 },
    { day: 'Sat', active: 28 },
    { day: 'Sun', active: 34 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 22 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Class Engagement & Retention Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Teacher Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Cohort longitudinal metrics on assignment completion, daily engagement, and average mastery.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Current Semester</span>
        </div>
      </div>

      {/* 3 Metric Cards (Screen 22 from Reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Cohort Engagement Rate</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {analytics?.engagement ?? 82}%
            </div>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">+6% vs last week</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Assignment Completion</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {analytics?.assignmentCompletion ?? 76}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">36 of 48 submitted on time</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Class Overall Average</div>
            <div className="text-3xl font-extrabold text-indigo-600 mt-1">
              {analytics?.classAverage ?? 68}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Continuous twin aggregate</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Weekly Student Activity Chart (Screen 22 from Reference) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Weekly Active Students</h2>
            <p className="text-xs text-slate-500">Daily unique learners logging in and practicing with their twin</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Peak: Thursday (46 students)
          </span>
        </div>

        <div className="h-56 flex items-end justify-between gap-2 sm:gap-6 pt-8 px-4">
          {(weekly || []).map((w: any, idx: number) => {
            const heightPercent = Math.round((w.active / 48) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.active}
                </span>
                <div className="w-full max-w-[48px] bg-slate-100 rounded-2xl h-44 flex items-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-xl transition-all duration-500 group-hover:from-purple-500 group-hover:to-indigo-400"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">{w.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
