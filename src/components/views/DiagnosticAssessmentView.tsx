import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Brain, X } from 'lucide-react';
import { Question } from '../../types.ts';

interface DiagnosticAssessmentViewProps {
  onCompleteDiagnostic: (score: number) => void;
  onExit: () => void;
}

export const DiagnosticAssessmentView: React.FC<DiagnosticAssessmentViewProps> = ({
  onCompleteDiagnostic,
  onExit,
}) => {
  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      conceptId: 'c_prob',
      difficulty: 'Easy',
      question: 'What is the probability of getting a head in a fair coin toss?',
      options: ['1/2', '1/3', '1/4', '1'],
      correctAnswer: '1/2',
      explanation: 'A fair coin has 2 equally likely outcomes (Head, Tail). The probability of Head is 1/2.',
    },
    {
      id: 'q2',
      conceptId: 'c_prob',
      difficulty: 'Easy',
      question: 'If two fair dice are rolled, what is the probability that the sum of the two faces equals 7?',
      options: ['1/6', '7/36', '1/12', '5/36'],
      correctAnswer: '1/6',
      explanation: 'There are 6 winning combinations: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) out of 36 outcomes. 6/36 = 1/6.',
    },
    {
      id: 'q3',
      conceptId: 'c_cond_prob',
      difficulty: 'Medium',
      question: 'Given P(A) = 0.5, P(B) = 0.4, and P(A ∩ B) = 0.2. What is P(A | B)?',
      options: ['0.50', '0.40', '0.20', '0.70'],
      correctAnswer: '0.50',
      explanation: 'P(A | B) = P(A ∩ B) / P(B) = 0.2 / 0.4 = 0.50.',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = sampleQuestions[currentIndex];
  const selectedOption = selectedAnswers[currentQ.id];

  const handleSelect = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: option,
    });
  };

  const handleNext = () => {
    if (currentIndex < sampleQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate score and finish
      setIsSubmitting(true);
      let correct = 0;
      sampleQuestions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          correct += 1;
        }
      });
      const finalScore = Math.round((correct / sampleQuestions.length) * 100);
      setTimeout(() => {
        onCompleteDiagnostic(finalScore);
      }, 400);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col justify-center">
      {/* Top Breadcrumb & Progress */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">Diagnostic Assessment</h1>
            <p className="text-xs text-slate-500">Establishing initial twin mastery baseline</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Question {currentIndex + 1} of {sampleQuestions.length}
            </span>
            <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / sampleQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            id="diagnostic-btn-exit"
            onClick={onExit}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
            title="Exit to Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Left: Question Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
              Difficulty: {currentQ.difficulty}
            </span>
            <span className="text-xs font-medium text-slate-400">Concept: Probability Foundations</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {currentQ.question}
          </h2>

          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={`p-4 rounded-2xl border-2 text-sm font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-400'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedOption || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <span>{currentIndex === sampleQuestions.length - 1 ? 'Finish & Build Twin' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Encouragement Card in Clean Light Mode */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50 via-purple-50/60 to-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200 text-slate-900 relative overflow-hidden flex flex-col justify-between min-h-[360px] shadow-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center justify-center text-indigo-600 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-snug">
              Take a breath. <br />
              You're building your twin!
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
              Every choice you make calibrates your personalized cognitive graph. Mistakes are just prerequisite gaps we'll help you master.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white shadow-sm ring-2 ring-indigo-200">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Student Twin"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Siva's Twin</div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Real-time Calibration Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
