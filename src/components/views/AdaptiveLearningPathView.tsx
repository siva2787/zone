import React from 'react';
import {
  Milestone,
  CheckCircle2,
  PlayCircle,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { AdaptiveLearningPath } from '../../types.ts';

interface AdaptiveLearningPathViewProps {
  path: AdaptiveLearningPath | null;
  onSelectConcept: (params: any) => void;
  onStartLesson: (params: any) => void;
}

export const AdaptiveLearningPathView: React.FC<AdaptiveLearningPathViewProps> = ({
  path,
  onSelectConcept,
  onStartLesson,
}) => {
  const steps = path?.steps || [
    {
      conceptId: 'c_prob',
      conceptName: 'Probability Foundations',
      status: 'Completed' as const,
      masteryScore: 85,
      prerequisiteGapsCount: 0,
      estimatedMinutes: 20,
      reasonForPlacement: 'Foundational baseline mastered.',
    },
    {
      conceptId: 'c_rand_var',
      conceptName: 'Random Variables',
      status: 'Completed' as const,
      masteryScore: 78,
      prerequisiteGapsCount: 0,
      estimatedMinutes: 25,
      reasonForPlacement: 'Prerequisite satisfied.',
    },
    {
      conceptId: 'c_cond_prob',
      conceptName: 'Conditional Probability',
      status: 'In Progress' as const,
      masteryScore: 45,
      prerequisiteGapsCount: 0,
      estimatedMinutes: 30,
      reasonForPlacement: 'Priority bottleneck for Bayes Theorem.',
    },
    {
      conceptId: 'c_bayes',
      conceptName: 'Bayes Theorem',
      status: 'Recommended Next' as const,
      masteryScore: 38,
      prerequisiteGapsCount: 1,
      estimatedMinutes: 35,
      reasonForPlacement: 'Recommended once Conditional Probability is reinforced.',
    },
    {
      conceptId: 'c_naive_bayes',
      conceptName: 'Naive Bayes Classifier',
      status: 'Locked' as const,
      masteryScore: 30,
      prerequisiteGapsCount: 2,
      estimatedMinutes: 40,
      reasonForPlacement: 'Locked until Bayes Theorem is mastered.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 11 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Milestone className="w-3.5 h-3.5" />
            <span>Dynamic Roadmap Generation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Adaptive Learning Path
          </h1>
          <p className="text-xs text-slate-500">
            Automatically restructured according to your cognitive gaps and target milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full text-indigo-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Goal: Become ML-Ready</span>
        </div>
      </div>

      {/* Path List View (Screen 11 from Reference) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        <div className="space-y-6">
          {(steps || []).map((step, idx) => {
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'In Progress';
            const isNext = step.status === 'Recommended Next';
            const isLocked = step.status === 'Locked';

            return (
              <div
                key={step.conceptId}
                className={`relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all ${
                  isInProgress || isNext
                    ? 'border-indigo-400 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/10'
                    : isCompleted
                    ? 'border-slate-200 bg-white hover:bg-slate-50/80'
                    : 'border-slate-200/80 bg-slate-50/50 opacity-70'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Indicator Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isInProgress
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isNext
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isInProgress ? (
                      <PlayCircle className="w-5 h-5" />
                    ) : isNext ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Title and details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {step.conceptName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isInProgress
                            ? 'bg-indigo-100 text-indigo-800'
                            : isNext
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.reasonForPlacement}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> 3 Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> 5 Practice Problems
                      </span>
                      <span>~{step.estimatedMinutes} min</span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="mt-4 md:mt-0 flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-800">
                      {step.masteryScore}%
                    </div>
                    <div className="text-[10px] text-slate-400">Mastery</div>
                  </div>

                  <button
                    onClick={() =>
                      onStartLesson({
                        conceptId: step.conceptId,
                        conceptName: step.conceptName,
                        masteryScore: step.masteryScore,
                        detectedGap: step.reasonForPlacement,
                        initialPrompt: `Guide me step-by-step through lesson module: ${step.conceptName} (Current Mastery: ${step.masteryScore}%).`,
                      })
                    }
                    disabled={isLocked}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      isInProgress || isNext
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : isNext ? 'Start Next' : 'Locked'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
