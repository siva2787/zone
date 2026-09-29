import React, { useEffect, useState } from 'react';
import {
  GitFork,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const KnowledgeGapAnalyticsView: React.FC = () => {
  const [heatmap, setHeatmap] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/teacher/knowledge-gaps')
      .then((res) => res.json())
      .then((data) => setHeatmap(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 20 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
            <GitFork className="w-3.5 h-3.5" />
            <span>Cohort Knowledge Distribution Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Gap Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Cross-sectional analysis of concept mastery distribution across 48 students.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-rose-700">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Low (&lt;50%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Med (50-74%)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> High (&gt;75%)
          </span>
        </div>
      </div>

      {/* Heatmap Matrix Table (Screen 20 from Reference) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Topic Mastery Breakdown (% of class)</h2>
          <span className="text-xs text-slate-400">Total Enrollment: 48</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Concept / Topic</th>
                <th className="py-3.5 px-4 text-center">Low (&lt;50%)</th>
                <th className="py-3.5 px-4 text-center">Medium (50-74%)</th>
                <th className="py-3.5 px-4 text-center">High (&gt;75%)</th>
                <th className="py-3.5 px-6">Twin AI Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(heatmap || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{row.topic}</td>

                  {/* Low */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl font-extrabold ${
                        row.low > 30 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.low}%
                    </span>
                  </td>

                  {/* Medium */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-xl font-bold bg-amber-50 text-amber-800">
                      {row.medium}%
                    </span>
                  </td>

                  {/* High */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl font-extrabold ${
                        row.high > 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.high}%
                    </span>
                  </td>

                  {/* Alert */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-xs">
                      {row.low > 30 && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                      <span className={row.low > 30 ? 'font-semibold text-rose-900' : 'text-slate-600'}>
                        {row.alert}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
