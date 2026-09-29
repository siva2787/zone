import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  GitFork,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { KnowledgeGap } from '../../types.ts';

interface KnowledgeGapExplorerViewProps {
  gaps: KnowledgeGap[];
  onFixGap: (params: any) => void;
  onNavigateGraph: () => void;
}

export const KnowledgeGapExplorerView: React.FC<KnowledgeGapExplorerViewProps> = ({
  gaps,
  onFixGap,
  onNavigateGraph,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Automated Diagnostic Backtracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Knowledge Gaps Explorer
          </h1>
          <p className="text-xs text-slate-500">
            Root-cause analysis of prerequisite deficiencies detected by your learning twin.
          </p>
        </div>

        <button
          onClick={onNavigateGraph}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          <GitFork className="w-4 h-4 text-indigo-600" />
          <span>View In Knowledge Graph</span>
        </button>
      </div>

      {/* Featured Primary Gap Card (Screen 9 from Reference: Bayes Theorem) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 uppercase tracking-wide">
              High Priority Prerequisite Gap
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Detected Gap: Bayes Theorem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Subject: Machine Learning Foundations</p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-rose-600">38%</div>
            <div className="text-xs font-semibold text-slate-400">Current Mastery</div>
          </div>
        </div>

        {/* Why this gap exists? (Screen 9 from Reference) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Why does this gap exist?</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                During recent assessments, questions requiring <strong className="text-slate-900">joint and conditional probability inversion</strong> scored below the 50% threshold.
              </p>
              <p>
                Bayes Theorem directly depends on <strong className="text-indigo-700">Conditional Probability P(A|B)</strong>. Because that prerequisite node has a low mastery score (45%), the twin flagged Bayes Theorem as structurally blocked.
              </p>
            </div>
          </div>

          {/* Prerequisite Chain Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-amber-600" />
              <span>Prerequisite Dependency Chain</span>
            </h3>

            <div className="space-y-2.5">
              {/* Step 1: Probability */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-950">1. Probability Foundations</span>
                </div>
                <span className="font-bold text-emerald-700">85% Mastered</span>
              </div>

              {/* Step 2: Conditional Probability (The Gap!) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-bold text-rose-950">2. Conditional Probability</div>
                    <div className="text-[10px] text-rose-700 font-medium">Missing prerequisite bottleneck</div>
                  </div>
                </div>
                <span className="font-extrabold text-rose-700">45% Weak</span>
              </div>

              {/* Step 3: Bayes Theorem */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-indigo-950">3. Bayes Theorem (Blocked)</span>
                </div>
                <span className="font-bold text-indigo-700">38% Blocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Fix This Gap (Screen 9 from Reference) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Fixing the Conditional Probability bottleneck will automatically resolve this gap in your twin.
          </p>

          <button
            onClick={() =>
              onFixGap({
                conceptId: 'c_bayes',
                conceptName: 'Bayes Theorem',
                masteryScore: 38,
                detectedGap: 'Prerequisite bottleneck in Conditional Probability (45%)',
                initialPrompt: 'Can you explain why my prerequisite weakness in Conditional Probability is blocking Bayes Theorem and guide me through step-by-step exercises to fix it?',
              })
            }
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fix This Gap with Gemini AI Tutor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Other Detected Gaps */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Other Flagged Concepts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(gaps || []).filter((g) => g.conceptId !== 'c_bayes').map((gap) => (
            <div
              key={gap.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{gap.conceptName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Mastery: {gap.masteryScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{gap.reason}</p>
              </div>

              <button
                onClick={() =>
                  onFixGap({
                    conceptId: gap.conceptId,
                    conceptName: gap.conceptName,
                    masteryScore: gap.masteryScore,
                    detectedGap: gap.reason,
                    initialPrompt: `I want to resolve my knowledge gap in ${gap.conceptName} (${gap.masteryScore}%). Please provide a clear breakdown and targeted practice questions.`,
                  })
                }
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
              >
                Launch Targeted Practice →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
