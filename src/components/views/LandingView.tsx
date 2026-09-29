import React from 'react';
import {
  Brain,
  Sparkles,
  ArrowRight,
  GitFork,
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  Zap,
  Target,
  Users,
  Layers,
  Award,
  ChevronRight,
  GraduationCap,
  Activity,
  School,
  FileCheck,
} from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onExploreDashboard?: () => void;
  onLogin: () => void;
  onRegister?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onLogin,
  onRegister,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Floating Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={onLogin}
            id="landing-nav-brand"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg font-black text-slate-900 tracking-tight">LearnTwin</span>
                <span className="text-lg font-black text-indigo-600">AI</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                Cognitive Learner Modeling
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Twin Capabilities
            </a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">
              AI Architecture
            </a>
            <a href="#educators" className="hover:text-indigo-600 transition-colors">
              For Educators
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onLogin}
              id="landing-btn-login"
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
            >
              Sign In
            </button>
            <button
              onClick={onRegister || onGetStarted}
              id="landing-btn-register"
              className="px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all hidden sm:inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Register</span>
            </button>
            <button
              onClick={onGetStarted}
              id="landing-btn-start"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle Ambient Warm/Cool Tint Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-[350px] h-[350px] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Mission, Value Prop, Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Yuva Megathon 2026 • AI-Powered Personalized Learning Twin</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Meet Your <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Digital Learning Twin
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
              Not another generic chatbot. LearnTwin builds an active, mathematical model of your brain:
              tracking knowledge mastery, diagnosing prerequisite bottlenecks, and predicting memory fading with spaced retention.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={onGetStarted}
                id="hero-btn-onboarding"
                className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Start Student Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLogin}
                id="hero-btn-dashboard"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Sign In to Dashboard</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">10K+</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Active Learners</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600">92%</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Retention Rate</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-purple-600">Dynamic</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">Knowledge Graph</div>
              </div>
            </div>
          </div>

          {/* Right Column: Holographic Learning Twin Visual Card in Pristine Light Mode */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-xl relative">
              {/* Top Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Twin State: Synchronized
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  ID: TWIN-SIVA-72
                </span>
              </div>

              {/* Avatar Centerpiece with Holographic Badges */}
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-gradient-to-tr from-slate-100 via-indigo-50 to-purple-50 flex items-center justify-center mt-4 p-4 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                  alt="Student Digital Twin"
                  className="w-44 h-44 rounded-2xl object-cover shadow-lg border-2 border-white ring-4 ring-indigo-100"
                />

                {/* Floating telemetry pills */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-indigo-200 text-[11px] font-bold text-indigo-800 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Mastery: 72%</span>
                </div>

                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-purple-200 text-[11px] font-bold text-purple-800 flex items-center gap-1.5 shadow-sm">
                  <GitFork className="w-3 h-3 text-purple-600" />
                  <span>Graph Synced</span>
                </div>

                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-rose-200 text-[11px] font-bold text-rose-800 flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3 h-3 text-rose-600" />
                  <span>Retention: 90%</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 shadow-sm">
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>Gemini Tutor</span>
                </div>
              </div>

              {/* Real-Time Telemetry Stats */}
              <div className="mt-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-semibold">Cognitive Momentum</span>
                  <span className="text-emerald-600 font-black">+12% this week</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full w-[72%]" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Prerequisite Gap: Conditional Probability</span>
                  </div>
                  <button
                    onClick={onLogin}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    View Twin →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Closed-Loop Cognitive Flow */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Deterministic Learning Loop</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How LearnTwin AI Operates
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A closed-loop system connecting diagnostic assessment, mathematical modeling, gap detection, and adaptive revision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Diagnostic Test',
                desc: 'Adaptive multi-tiered questions assess baseline conceptual depth and latency.',
                icon: CheckCircle2,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-100',
              },
              {
                step: '02',
                title: 'Knowledge Graph',
                desc: 'Prerequisite dependencies are mapped dynamically across topics and sub-skills.',
                icon: GitFork,
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-100',
              },
              {
                step: '03',
                title: 'Gap Backtracking',
                desc: 'Root bottleneck detection pinpoints exactly why downstream topics fail.',
                icon: Target,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
              },
              {
                step: '04',
                title: 'Gemini AI Tutor',
                desc: 'Socratic dialogue scaffolds explanations based strictly on the student twin state.',
                icon: MessageSquare,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
              },
              {
                step: '05',
                title: 'Spaced Repetition',
                desc: 'Ebbinghaus forgetting curve scheduling preserves memory health before it fades.',
                icon: Clock,
                color: 'text-rose-600',
                bg: 'bg-rose-50',
                border: 'border-rose-100',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all space-y-3 relative group flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-xs font-mono font-black text-slate-400">{item.step}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <div
                    onClick={onLogin}
                    className="pt-3 border-t border-slate-200/80 flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span>Explore module</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-20 bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Core Pillars</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Crafted for Real Academic Growth
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every feature serves a measurable cognitive purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Personalized Digital Twin</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                A mathematical twin representation mirroring each learner’s strengths, gaps, cognitive momentum, and decay timelines.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Per-concept mastery percentage tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cognitive learning momentum calculation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time sync with teacher intervention alerts</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Socratic Gemini 2.5 Tutor</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Context-injected tutor that knows what prerequisite you are struggling with before you even type your question.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Step-by-step Socratic guided questioning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Adaptive analogies tailored to your learning style</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Interactive quizzes that verify understanding</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Ebbinghaus Retention Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Smart revision scheduler that triggers 2-minute memory booster workouts right as concept retention drops below 60%.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  <span>Predicted retention scores for all concepts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  <span>Urgent revision alerts with 1-click practice</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  <span>Continuous memory stability reinforcement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* For Educators Section */}
      <section id="educators" className="py-20 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
              <School className="w-3.5 h-3.5" />
              <span>Teacher Telemetry Portal</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Classroom Insights Without the Guesswork
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Educators get a birds-eye view of every student's cognitive twin: live mastery heatmaps, high-risk dropoff alerts, and 1-click tailored remedial assignments.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xl font-bold text-slate-900">Live Heatmaps</div>
                <div className="text-xs text-slate-500 mt-1">Class-wide concept bottlenecks mapped instantly</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xl font-bold text-purple-600">Smart Alerts</div>
                <div className="text-xs text-slate-500 mt-1">Intervene before exam failure occurs</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="text-xs font-bold text-slate-900">Recent Class Interventions</div>
              <span className="text-[11px] font-bold text-indigo-600">AI & Data Science (Sem 5)</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Siva Vignesh', gap: 'Conditional Probability', priority: 'High Risk', action: 'Push Bayes Remedial' },
                { name: 'Kavitha R', gap: 'Gradient Descent', priority: 'Medium', action: 'Visual Calculus Deck' },
                { name: 'Rahul M', gap: 'Vector Spaces', priority: 'Critical', action: '1-on-1 Review Scheduled' },
              ].map((row, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-[11px] text-slate-500">{row.gap}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${row.priority === 'High Risk' || row.priority === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {row.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner in Clean High-Contrast Light / Indigo */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 sm:px-6 lg:px-8 text-center shadow-inner">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Build Your Learning Twin?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Experience the working prototype built for the Yuva Megathon. Step through the student onboarding or sign in to access your dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              id="cta-btn-onboard"
              className="px-6 py-3.5 rounded-xl bg-white text-indigo-900 font-black text-xs sm:text-sm hover:bg-slate-100 shadow-xl transition-all hover:scale-[1.02]"
            >
              Start Student Onboarding
            </button>
            <button
              onClick={onLogin}
              id="cta-btn-login"
              className="px-6 py-3.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 border border-indigo-400/40 text-white font-bold text-xs sm:text-sm transition-all"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-100 border-t border-slate-200 text-slate-500 text-xs text-center px-4">
        <p>© 2026 LearnTwin AI • Yuva Megathon Prototype • Empowering Every Learner with an AI Digital Twin</p>
      </footer>
    </div>
  );
};