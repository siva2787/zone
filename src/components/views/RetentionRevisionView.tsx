import React, { useState, useEffect } from 'react';
import {
  Clock,
  HeartPulse,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { RetentionHealthResult, RetentionScheduleItem } from '../../types.ts';

interface RetentionRevisionViewProps {
  onPracticeConcept: (params: any) => void;
}

export const RetentionRevisionView: React.FC<RetentionRevisionViewProps> = ({
  onPracticeConcept,
}) => {
  const [retentionData, setRetentionData] = useState<RetentionHealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [practiceMessage, setPracticeMessage] = useState<string | null>(null);

  const fetchRetention = async () => {
    try {
      const res = await fetch('/api/retention');
      const data = await res.json();
      setRetentionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetention();
  }, []);

  const handlePractice = async (item: any) => {
    const conceptId = typeof item === 'string' ? item : item.conceptId;
    const conceptName = typeof item === 'string' ? conceptId : item.conceptName || conceptId;
    const masteryScore = typeof item === 'string' ? 70 : item.predictedRetentionScore || 70;

    try {
      await fetch('/api/retention/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conceptId }),
      });
      setPracticeMessage('Spaced repetition session logged! Memory stability reinforced.');
      setTimeout(() => setPracticeMessage(null), 3500);
      onPracticeConcept({
        conceptId,
        conceptName,
        masteryScore,
        initialPrompt: `I am conducting a spaced-repetition memory review for ${conceptName}. Please generate a short practice question or concept breakdown to reinforce my memory curve.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: RetentionScheduleItem['retentionStatus']) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Fading':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Needs Revision':
        return 'bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 13 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Spaced Repetition & Forgetting Curve Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Retention & Revision
          </h1>
          <p className="text-xs text-slate-500">
            Ebbinghaus mathematical decay calculations predicting when you need to review.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs">
          <HeartPulse className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-xs font-semibold text-slate-500">Overall Retention</div>
            <div className="text-sm font-extrabold text-slate-900">
              {retentionData?.overallRetentionHealth ?? 81}% Healthy
            </div>
          </div>
        </div>
      </div>

      {practiceMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{practiceMessage}</span>
        </div>
      )}

      {loading && !retentionData && (
        <div className="p-8 text-center text-xs font-semibold text-slate-400 bg-white rounded-3xl border border-slate-200">
          Loading spaced repetition schedule...
        </div>
      )}

      {/* Revision Concept Cards (Screen 13 from Reference) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {((retentionData?.schedule || (retentionData as any)?.records?.map((r: any) => ({
          conceptId: r.conceptId,
          conceptName: r.conceptName,
          retentionStatus: r.status || 'Healthy',
          predictedRetentionScore: r.masteryScore ?? 75,
          daysSincePractice: r.daysSincePractice ?? 0,
          recommendedReviewDate: r.nextScheduledReview || '',
        }))) || []).map((item: any) => {
          const isUrgent = item.retentionStatus === 'Needs Revision';

          return (
            <div
              key={item.conceptId}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                isUrgent
                  ? 'border-rose-300 shadow-md ring-2 ring-rose-400/20'
                  : 'border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      item.retentionStatus
                    )}`}
                  >
                    {item.retentionStatus}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.daysSincePractice} days ago
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {item.conceptName}
                </h3>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Predicted Retention</span>
                    <span
                      className={`font-bold ${
                        item.predictedRetentionScore < 50
                          ? 'text-rose-600'
                          : item.predictedRetentionScore < 75
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {item.predictedRetentionScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.predictedRetentionScore < 50
                          ? 'bg-rose-500'
                          : item.predictedRetentionScore < 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.predictedRetentionScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Next due: {item.recommendedReviewDate}
                </span>

                <button
                  onClick={() => handlePractice(item)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    isUrgent
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Practice Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
