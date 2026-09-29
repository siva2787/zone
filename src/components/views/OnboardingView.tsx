import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  User,
  BookOpen,
  Sliders,
  Target,
  Sparkles,
  Brain,
  Clock,
  Compass,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingViewProps {
  onCompleteOnboarding: (data: {
    name: string;
    department: string;
    yearSemester: string;
    college: string;
    learningMode: 'Visual' | 'Practical' | 'Theoretical' | 'Interactive';
    goals: string;
  }) => void;
  onTakeDiagnostic: () => void;
  onBackToLanding?: () => void;
  onSkipToDashboard?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onCompleteOnboarding,
  onTakeDiagnostic,
  onBackToLanding,
  onSkipToDashboard,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Siva');
  const [department, setDepartment] = useState('AI & Data Science');
  const [yearSemester, setYearSemester] = useState('3rd Year');
  const [college, setCollege] = useState('Arasu Engineering College');
  const [learningMode, setLearningMode] = useState<'Visual' | 'Practical' | 'Theoretical' | 'Interactive'>('Visual');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Machine Learning',
    'Statistics & Probability',
    'Python for AI',
  ]);
  const [primaryGoal, setPrimaryGoal] = useState('Become ML-Ready');
  const [dailyTimeMinutes, setDailyTimeMinutes] = useState(30);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onCompleteOnboarding({
        name,
        department,
        yearSemester,
        college,
        learningMode,
        goals: primaryGoal,
      });
      onTakeDiagnostic();
    }
  };

  const handleFinishDirectly = () => {
    onCompleteOnboarding({
      name,
      department,
      yearSemester,
      college,
      learningMode,
      goals: primaryGoal,
    });
    if (onSkipToDashboard) {
      onSkipToDashboard();
    } else {
      onTakeDiagnostic();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Background ambient soft tints */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Side: Onboarding Steps */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Bar with Navigation */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 leading-none">Twin Calibration Wizard</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Personalized Cognitive Setup</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {onBackToLanding && (
                  <button
                    type="button"
                    id="onboarding-nav-landing"
                    onClick={onBackToLanding}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Landing</span>
                  </button>
                )}
                {onSkipToDashboard && (
                  <button
                    type="button"
                    id="onboarding-nav-skip"
                    onClick={onSkipToDashboard}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-all"
                  >
                    Skip to App →
                  </button>
                )}
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[
                { num: 1, label: 'Profile', icon: User },
                { num: 2, label: 'Subjects', icon: BookOpen },
                { num: 3, label: 'Modality', icon: Sliders },
                { num: 4, label: 'Milestone', icon: Target },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      step >= s.num
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:inline ${
                      step >= s.num ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Step 1: Tell Us About Yourself */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Step 1: Academic Profile
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    This initializes your student metadata and anchors your learning twin baseline.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="onboarding-input-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 placeholder-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                      <select
                        id="onboarding-select-dept"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 shadow-xs"
                      >
                        <option>AI & Data Science</option>
                        <option>Computer Science & Engineering</option>
                        <option>Information Technology</option>
                        <option>Electronics & Communication</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Year / Semester</label>
                      <select
                        id="onboarding-select-year"
                        value={yearSemester}
                        onChange={(e) => setYearSemester(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 shadow-xs"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      id="onboarding-input-college"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 shadow-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Focus Subjects */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Step 2: Focus Domain & Subjects
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Select the foundational and applied areas you want modeled in your knowledge graph.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    { name: 'Machine Learning', concepts: '8 Core Concepts', tag: 'High Priority' },
                    { name: 'Statistics & Probability', concepts: '6 Core Concepts', tag: 'Prerequisite Core' },
                    { name: 'Python for AI', concepts: '10 Core Concepts', tag: 'Applied Tooling' },
                    { name: 'Data Structures & Algorithms', concepts: '12 Concepts', tag: 'CS Foundations' },
                    { name: 'Deep Learning & Neural Networks', concepts: '7 Concepts', tag: 'Advanced' },
                  ].map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.name);
                    return (
                      <div
                        key={sub.name}
                        onClick={() => {
                          if (isSelected) {
                            if (selectedSubjects.length > 1) {
                              setSelectedSubjects(selectedSubjects.filter((s) => s !== sub.name));
                            }
                          } else {
                            setSelectedSubjects([...selectedSubjects, sub.name]);
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-900">{sub.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{sub.concepts} • {sub.tag}</div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Learning Modality */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Step 3: Preferred Learning Modality
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The Gemini AI Tutor and adaptive interventions adjust their explanation style to match your mind.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      mode: 'Visual',
                      title: 'Visual & Conceptual',
                      desc: 'Venn diagrams, spatial trees, concept graphs, and intuitive geometric analogies.',
                    },
                    {
                      mode: 'Practical',
                      title: 'Practical & Code-First',
                      desc: 'Worked Python calculations, numerical proofs, and runnable algorithm snippets.',
                    },
                    {
                      mode: 'Theoretical',
                      title: 'Theoretical & Rigorous',
                      desc: 'Formal mathematical formulations, axiomatic derivations, and theorem definitions.',
                    },
                    {
                      mode: 'Interactive',
                      title: 'Socratic Dialogue',
                      desc: 'Guided step-by-step questions where the tutor helps you discover the answer yourself.',
                    },
                  ].map((item) => (
                    <div
                      key={item.mode}
                      onClick={() => setLearningMode(item.mode as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        learningMode === item.mode
                          ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-indigo-600 mb-1">
                          {item.mode} Style
                        </div>
                        <div className="text-sm font-bold text-slate-900">{item.title}</div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {learningMode === item.mode ? 'Selected' : 'Click to select'}
                        </span>
                        {learningMode === item.mode && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Primary Goal & Daily Commitment */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Step 4: Target Outcome & Daily Goal
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We will construct an adaptive learning path optimized to achieve this specific milestone.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    'Become ML-Ready (Core Goal)',
                    'Master Probability & Statistics for AI Careers',
                    'Crack Machine Learning & Data Science Interviews',
                    'University Semester Top Honors Exam Prep',
                  ].map((goal) => (
                    <div
                      key={goal}
                      onClick={() => setPrimaryGoal(goal)}
                      className={`p-3.5 rounded-2xl border text-xs font-bold cursor-pointer flex items-center justify-between transition-all ${
                        primaryGoal === goal
                          ? 'bg-purple-50/90 border-purple-500 text-purple-950 shadow-xs ring-2 ring-purple-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <span>{goal}</span>
                      {primaryGoal === goal && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Daily Targeted Practice: <span className="text-indigo-600 font-black">{dailyTimeMinutes} minutes/day</span>
                  </label>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDailyTimeMinutes(mins)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          dailyTimeMinutes === mins
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                id="onboarding-btn-back"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 py-2 px-3 rounded-xl transition-colors hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              {step === 4 && (
                <button
                  type="button"
                  id="onboarding-btn-skip-dash"
                  onClick={handleFinishDirectly}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
                >
                  Skip to Dashboard
                </button>
              )}

              <button
                type="button"
                id="onboarding-btn-next"
                onClick={handleNext}
                className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <span>{step === 4 ? 'Launch Diagnostic Test' : 'Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Student Twin Hologram Card in Clean Light Mode */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-slate-100 p-6 sm:p-10 text-slate-900 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-700 text-[10px] font-bold border border-indigo-200 shadow-xs">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Calibrating Twin</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-bold">Step {step}/4</span>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-white shadow-xl relative group ring-4 ring-indigo-100">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                  alt="Student Onboarding"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-center text-white">
                  <div className="text-xs font-bold">{name || 'Learner'}</div>
                  <div className="text-[10px] text-indigo-200">{department}</div>
                </div>
              </div>
            </div>

            {/* Live Calibrated Stats in Crisp White Card */}
            <div className="mt-6 space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Modality:</span>
                <span className="font-bold text-indigo-700">{learningMode}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Target Milestone:</span>
                <span className="font-bold text-purple-700 truncate max-w-[140px]">{primaryGoal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Study Target:</span>
                <span className="font-bold text-emerald-700">{dailyTimeMinutes} min/day</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <p className="text-xs font-medium text-purple-700 italic font-semibold">
              "Every Learner, A Brighter Tomorrow."
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Next: Anchor your initial knowledge graph with a 3-question diagnostic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
