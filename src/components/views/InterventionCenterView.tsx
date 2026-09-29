import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Users,
} from 'lucide-react';
import { InterventionItem } from '../../types.ts';

export const InterventionCenterView: React.FC = () => {
  const [interventions, setInterventions] = useState<InterventionItem[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/teacher/interventions')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const normalized: InterventionItem[] = list.map((item: any) => ({
          ...item,
          concept: item.concept || item.topicName || 'Foundational Concept',
          groupName: item.groupName || `${item.topicName || item.concept || 'Cohort'} Remediation Group`,
          severity: item.severity || (item.affectedCount && item.affectedCount >= 10 ? 'HIGH' : 'MEDIUM'),
          affectedStudents: Array.isArray(item.affectedStudents) && item.affectedStudents.length > 0
            ? item.affectedStudents
            : (item.studentName ? [item.studentName] : ['Siva', 'Priya', 'Karthik']),
          reason: item.reason || item.issue || 'Knowledge prerequisite gap identified.',
          createdAt: item.createdAt ? (item.createdAt.includes('T') ? new Date(item.createdAt).toLocaleDateString() : item.createdAt) : 'Active',
        }));
        setInterventions(normalized);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleUpdateStatus = async (id: string, status: InterventionItem['status']) => {
    try {
      await fetch('/api/teacher/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setInterventions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      setActionSuccess(true);
      setTimeout(() => {
        setActionSuccess(false);
        setSelectedIntervention(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 21 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Targeted Cohort Remediation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Intervention Center
          </h1>
          <p className="text-xs text-slate-500">
            Remediate clustered learning twin bottlenecks with automated micro-lessons or adaptive review sets.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          4 Active Cases
        </span>
      </div>

      {/* Intervention Cards (Screen 21 from Reference) */}
      <div className="space-y-4">
        {(interventions || []).map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-3xl p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              item.status === 'Pending'
                ? 'border-rose-200 shadow-sm ring-2 ring-rose-500/10'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    (item.severity || 'MEDIUM') === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.severity || 'MEDIUM'} Priority
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Concept: <strong>{item.concept || item.topicName || 'Foundational Concept'}</strong>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {item.createdAt}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {item.groupName || item.topicName || 'Cohort Intervention'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.reason || item.issue}
              </p>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Impacted Students:</span>
                <span className="font-bold text-slate-800">
                  {Array.isArray(item.affectedStudents) && item.affectedStudents.length > 0
                    ? item.affectedStudents.join(', ')
                    : (item.affectedCount ? `${item.affectedCount} Students in Cohort` : 'Targeted Cohort Students')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              {item.status === 'Resolved' ? (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resolved</span>
                </span>
              ) : (
                <button
                  onClick={() => setSelectedIntervention(item)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Take Action</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedIntervention && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              Deploy Remediation: {selectedIntervention.concept || selectedIntervention.topicName || 'Session'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted towards:{' '}
              <strong>
                {Array.isArray(selectedIntervention.affectedStudents) && selectedIntervention.affectedStudents.length > 0
                  ? selectedIntervention.affectedStudents.join(', ')
                  : (selectedIntervention.affectedCount ? `${selectedIntervention.affectedCount} Students` : 'Targeted Cohort')}
              </strong>
              . This will automatically inject an adaptive booster into their Learning Twin roadmaps.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateStatus(selectedIntervention.id, 'In Progress')}
                className="w-full p-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-colors text-left flex items-center justify-between"
              >
                <span>1. Push Gemini AI Socratic Review Set</span>
                <Send className="w-3.5 h-3.5 text-indigo-600" />
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedIntervention.id, 'Resolved')}
                className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors text-left flex items-center justify-between"
              >
                <span>2. Mark as Remediated in Lab Session</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg text-center">
                Action dispatched to student Learning Twins!
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedIntervention(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
