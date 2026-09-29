import React, { useState } from 'react';
import {
  Mail,
  Lock,
  ArrowRight,
  Brain,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  UserCheck,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (email: string) => void;
  onNavigateRegister: () => void;
  onDemoStudentLogin: () => void;
  onDemoTeacherLogin: () => void;
  onBackToLanding?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateRegister,
  onDemoStudentLogin,
  onDemoTeacherLogin,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('siva@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email);
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Background ambient soft pastel tints */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Form: Sign In */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Top Navigation & Brand */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight">LearnTwin AI</span>
              </div>

              {onBackToLanding && (
                <button
                  type="button"
                  id="login-btn-back-landing"
                  onClick={onBackToLanding}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Landing</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Sign in to synchronize your digital twin and resume your adaptive learning journey.
            </p>

            {/* Quick Demo Logins for Evaluators/Judges */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                ⚡ 1-Click Demo Evaluation Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="login-preset-student"
                  onClick={() => {
                    setEmail('siva@example.com');
                    onDemoStudentLogin();
                  }}
                  className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student (Siva)</span>
                </button>
                <button
                  type="button"
                  id="login-preset-teacher"
                  onClick={() => {
                    setEmail('teacher@example.com');
                    onDemoTeacherLogin();
                  }}
                  className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Teacher (Prof. Ram)</span>
                </button>
              </div>
            </div>

            {infoMessage && (
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center justify-between">
                <span>{infoMessage}</span>
                <button
                  onClick={() => setInfoMessage(null)}
                  className="text-indigo-600 font-bold ml-2 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="login-input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="siva@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 placeholder-slate-400 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() =>
                      setInfoMessage('Default prototype password is "password123". Or use the 1-click presets!')
                    }
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-input-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 placeholder-slate-400 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600">Remember on this device</span>
                </label>
              </div>

              <button
                type="submit"
                id="login-btn-submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Synchronizing Twin...' : 'Sign In to LearnTwin'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={onNavigateRegister}
              id="login-btn-to-register"
              className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Create an Account & Start Onboarding
            </button>
          </div>
        </div>

        {/* Right Graphic Banner in Clean Professional Light Theme */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-50 via-purple-50/60 to-slate-100 p-8 sm:p-10 text-slate-900 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/40 rounded-full blur-2xl pointer-events-none" />

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-700 text-[10px] font-bold border border-indigo-200 shadow-xs">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Digital Twin Synchronization</span>
            </span>

            <h3 className="text-2xl font-black mt-6 leading-tight tracking-tight text-slate-900">
              Learn <br />
              Adapt <br />
              Grow <br />
              Never Forget
            </h3>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              Every practice session, latency metric, and review schedule feeds back directly into your mathematical cognitive model.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 mt-8">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Closed-Loop Cognitive Engine</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              Calibrated for the Yuva Megathon with adaptive gap detection, Ebbinghaus spaced retention, and live teacher telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
