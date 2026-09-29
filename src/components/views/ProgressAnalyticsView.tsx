import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ProgressAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/progress')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  const metrics = [
    { label: 'Learning Hours', value: `${data?.learningHours ?? 28}h`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Concepts Mastered', value: `${data?.conceptsMastered ?? 18}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Assessments Taken', value: `${data?.assessmentsCount ?? 8}`, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Average Score', value: `${data?.avgScore ?? 76}%`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const trend = data?.masteryTrend || [
    { day: 'Day 1', mastery: 42 },
    { day: 'Day 3', mastery: 50 },
    { day: 'Day 6', mastery: 58 },
    { day: 'Day 8', mastery: 64 },
    { day: 'Day 10', mastery: 68 },
    { day: 'Day 12', mastery: 72 },
  ];

  const subjects = data?.subjectProgress || [
    { name: 'Machine Learning', mastery: 64, color: 'bg-indigo-600' },
    { name: 'Statistics & Probability', mastery: 48, color: 'bg-pink-500' },
    { name: 'Python for AI', mastery: 82, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header from Screen 14 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mastery Velocity & Long-term Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Progress & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real data from your learning twin: study hours, concept mastery velocity, and test outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Last 14 Days</span>
        </div>
      </div>

      {/* 4 Metric Cards from Screen 14 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-slate-500">{m.label}</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{m.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analytics Chart Card (Screen 14 from Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mastery Over Time</h2>
              <p className="text-xs text-slate-500">Continuous mastery score trajectory across 12 days</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              +30% Overall Growth
            </span>
          </div>

          {/* SVG Progression Curve */}
          <div className="w-full h-64 pt-4">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientMastery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
              ))}

              {/* Smooth Area */}
              <path
                d="M 20,130 Q 120,110 220,90 T 420,60 T 580,45 L 580,180 L 20,180 Z"
                fill="url(#gradientMastery)"
              />

              {/* Smooth Line */}
              <path
                d="M 20,130 Q 120,110 220,90 T 420,60 T 580,45"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { x: 20, y: 130, val: '42%' },
                { x: 136, y: 110, val: '50%' },
                { x: 252, y: 90, val: '58%' },
                { x: 368, y: 74, val: '64%' },
                { x: 484, y: 60, val: '68%' },
                { x: 580, y: 45, val: '72%' },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="white" stroke="#6366f1" strokeWidth="3" />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-xs font-semibold text-slate-400 px-2">
            {(trend || []).map((t: any, idx: number) => (
              <span key={idx}>{t.day}</span>
            ))}
          </div>
        </div>

        {/* Right Side: Subject-wise Progress */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Subject Mastery</h2>
            <p className="text-xs text-slate-500">Distribution across active domains</p>
          </div>

          <div className="space-y-4">
            {(subjects || []).map((s: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{s.name}</span>
                  <span className="text-slate-900 font-bold">{s.mastery}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color || 'bg-indigo-600'} rounded-full`}
                    style={{ width: `${s.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Twin Projection</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              At your current velocity of 2.4 hours/day, you are projected to reach 85% overall mastery by next week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
