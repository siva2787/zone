import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Brain,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Question } from '../../types.ts';

interface AdaptiveAssessmentViewProps {
  assessmentId?: string;
  onComplete: (score: number) => void;
  onNavigateTutor: (params: any) => void;
}

export const AdaptiveAssessmentView: React.FC<AdaptiveAssessmentViewProps> = ({
  assessmentId: initialAssessmentId = 'asmt_diag',
  onComplete,
  onNavigateTutor,
}) => {
  const [activeAssessmentId, setActiveAssessmentId] = useState<string>(initialAssessmentId);
  const [availableAssessments, setAvailableAssessments] = useState<any[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState<string>('Adaptive Assessment');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);

  // Fetch available assessments on mount
  useEffect(() => {
    fetch('/api/assessments')
      .then((res) => res.json())
      .then((data) => {
        if (data.assessments && data.assessments.length > 0) {
          setAvailableAssessments(data.assessments);
        }
      })
      .catch((err) => console.error('Failed to load assessments:', err));
  }, []);

  // Fetch assessment questions when activeAssessmentId changes
  useEffect(() => {
    setLoading(true);
    setShowResult(false);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setScoreResult(null);

    fetch(`/api/assessment/${activeAssessmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.assessment) {
          setAssessmentTitle(data.assessment.title || 'Adaptive Assessment');
        }
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch((err) => console.error('Failed to load questions:', err))
      .finally(() => setLoading(false));
  }, [activeAssessmentId]);

  const currentQ = questions[currentIndex];
  const selectedOption = currentQ ? selectedAnswers[currentQ.id] : undefined;

  const handleSelect = (option: string) => {
    if (!currentQ) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: option,
    });
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit assessment to server for exact grading
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId: activeAssessmentId,
            answers: selectedAnswers,
          }),
        });
        const data = await res.json();
        setScoreResult(data);
        setShowResult(true);
      } catch (err) {
        console.error('Submission failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSwitchAssessment = (newId: string) => {
    setActiveAssessmentId(newId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Preparing assessment questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header & Topic Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{assessmentTitle}</h1>
              <p className="text-xs text-slate-500">
                Dynamic difficulty evaluation • Real-time Learning Twin calibration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Live Twin Recalibration
            </span>
          </div>
        </div>

        {/* Built-in Quiz Topic Picker */}
        {availableAssessments.length > 0 && (
          <div className="pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Built-in Quiz Topic:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {availableAssessments.map((asmt) => {
                const isActive = asmt.id === activeAssessmentId;
                return (
                  <button
                    key={asmt.id}
                    onClick={() => handleSwitchAssessment(asmt.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{asmt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!showResult && currentQ ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Question Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
                Difficulty: {currentQ.difficulty}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
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
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedOption || isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <span>
                  {currentIndex === questions.length - 1
                    ? isSubmitting
                      ? 'Evaluating...'
                      : 'Submit & View Results'
                    : 'Next Question'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Progress Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Assessment Status
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Progress Tracker</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Progress</span>
                <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>Cognitive Feedback</span>
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Your answers will directly recalculate your mastery score, recalibrate your confidence index, and update your knowledge gap map.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Results Screen */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Summary Banner */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center max-w-2xl mx-auto space-y-6">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                (scoreResult?.score ?? 0) >= 70
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              {(scoreResult?.score ?? 0) >= 70 ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Assessment Results</h2>
              <p className="text-xs text-slate-500 mt-1">
                Here is your accurate score and question-by-question diagnostic evaluation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 inline-block px-10">
              <div
                className={`text-4xl font-black ${
                  (scoreResult?.score ?? 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {scoreResult?.score !== undefined ? scoreResult.score : 0}%
              </div>
              <div className="text-xs font-bold text-slate-500 mt-1">
                {scoreResult?.correctCount ?? 0} of {scoreResult?.totalQuestions ?? questions.length} Questions Correct
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowResult(false);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake This Quiz</span>
              </button>

              <button
                onClick={() => onComplete(scoreResult?.score ?? 0)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
              >
                Return to Dashboard
              </button>
            </div>
          </div>

          {/* Question-by-Question Breakdown Card List */}
          {scoreResult?.breakdown && scoreResult.breakdown.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">Detailed Answer Review</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {scoreResult.correctCount} Correct • {scoreResult.totalQuestions - scoreResult.correctCount} Incorrect
                </span>
              </div>

              <div className="space-y-4">
                {scoreResult.breakdown.map((item: any, idx: number) => {
                  const isCorrect = item.isCorrect;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-rose-200 bg-rose-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-lg border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Correct
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-lg border border-rose-200 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Incorrect
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-400">
                            Question {idx + 1}
                          </span>
                        </div>

                        {!isCorrect && (
                          <button
                            onClick={() =>
                              onNavigateTutor({
                                conceptId: currentQ?.conceptId || 'c_bayes',
                                initialPrompt: `I missed this question on my assessment: "${item.question}". I answered "${item.chosenOption}", but the correct answer is "${item.correctAnswer}". Can you explain why "${item.correctAnswer}" is correct and how I can avoid this mistake?`,
                              })
                            }
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            <span>Ask AI Tutor</span>
                          </button>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {item.question}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div
                          className={`p-3 rounded-xl border font-medium ${
                            isCorrect
                              ? 'bg-emerald-100/50 border-emerald-200 text-emerald-950'
                              : 'bg-rose-100/50 border-rose-200 text-rose-950'
                          }`}
                        >
                          <span className="font-bold block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                            Your Selected Answer:
                          </span>
                          <span>{item.chosenOption}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 font-medium text-slate-900">
                          <span className="font-bold block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                            Correct Answer:
                          </span>
                          <span>{item.correctAnswer}</span>
                        </div>
                      </div>

                      {item.explanation && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                            💡 Explanation:
                          </span>
                          <p>{item.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

