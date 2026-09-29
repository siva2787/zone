import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { TeacherStudentItem } from '../../types.ts';

interface ClassLearningTwinsViewProps {
  onSelectStudent: (student: TeacherStudentItem) => void;
}

export const ClassLearningTwinsView: React.FC<ClassLearningTwinsViewProps> = ({
  onSelectStudent,
}) => {
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'On Track' | 'Need Support' | 'At Risk'>('ALL');

  useEffect(() => {
    fetch('/api/teacher/students')
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const studentList = Array.isArray(students) ? students : [];
  const filtered = studentList.filter((s) => {
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 18 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Individualized Digital Twin Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Class Learning Twins
          </h1>
          <p className="text-xs text-slate-500">
            Inspect each learner's cognitive twin model, prerequisite bottlenecks, and momentum.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 shadow-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-700 shadow-xs font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="On Track">On Track</option>
            <option value="Need Support">Need Support</option>
            <option value="At Risk">At Risk</option>
          </select>
        </div>
      </div>

      {/* Student Roster Table (Screen 18 from Reference) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Learner Twin</th>
                <th className="py-3.5 px-4">Mastery</th>
                <th className="py-3.5 px-4">Velocity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Active Gaps</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => {
                const avatar = s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                const momentum = s.momentum ?? (s as any).learningMomentum ?? 12;
                const gaps = s.gaps || (s as any).knowledgeGaps || [];

                return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 ring-2 ring-indigo-500/10 shrink-0">
                      <img
                        src={avatar}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.id}</div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{s.overallMastery}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.overallMastery >= 75
                              ? 'bg-emerald-500'
                              : s.overallMastery >= 60
                              ? 'bg-indigo-600'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${s.overallMastery}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-emerald-600">
                    +{momentum}%
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'On Track'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'Need Support'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {gaps.map((g: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onSelectStudent(s)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1"
                    >
                      <span>Inspect Twin</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
