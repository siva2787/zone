import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { LearningGoal } from '../../types.ts';

export const LearningGoalsView: React.FC = () => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetch('/api/goals')
      .then((res) => res.json())
      .then((d) => setGoals(Array.isArray(d) ? d : []))
      .catch((err) => console.error(err));
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          targetDate: '2026-12-15',
          milestones: [
            { id: 'm1', skill: 'Core Foundations', progress: 50, status: 'In Progress' },
            { id: 'm2', skill: 'Applied Problem Solving', progress: 20, status: 'In Progress' },
          ],
        }),
      });
      const data = await res.json();
      if (data.goal) {
        setGoals([...goals, data.goal]);
      }
      setNewTitle('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Milestone Tracking & Competency Alignment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Goals
          </h1>
          <p className="text-xs text-slate-500">
            Target outcomes driving your twin's adaptive path recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Learning Goal</span>
        </button>
      </div>

      {/* Main Goal Card (Screen 15: "Become ML-Ready 72%") */}
      <div className="space-y-6">
        {(goals || []).map((goal) => (
          <div
            key={goal.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                  Primary Milestone
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  {goal.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Date: {goal.targetDate}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-extrabold text-indigo-600">
                  {goal.overallProgress}%
                </div>
                <div className="text-xs font-semibold text-slate-400">Total Completion</div>
              </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Skill Competencies
              </h3>

              <div className="space-y-3">
                {(goal.milestones || []).map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            m.progress === 100 ? 'text-emerald-500' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-slate-800 font-bold">{m.skill}</span>
                      </div>
                      <span className="text-slate-600">{m.progress}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          m.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Add New Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Deep Learning & Transformers"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
