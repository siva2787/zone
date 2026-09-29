import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Brain,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  GraduationCap,
  School,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types.ts';

interface RegisterViewProps {
  onRegisterSuccess: (userData: { name: string; email: string; role: UserRole }) => void;
  onNavigateLogin: () => void;
  onBackToLanding?: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onNavigateLogin,
  onBackToLanding,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess({
        name: name || (role === 'STUDENT' ? 'New Learner' : 'Dr. Educator'),
        email: email || 'learner@example.com',
        role,
      });
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900 relative overflow-hidden">
      {/* Background ambient soft pastel tints */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Form: Registration */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Top Navigation & Brand */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-slate-900 tracking-tight">LearnTwin AI</span>
              </div>

              {onBackToLanding && (
                <button
                  type="button"
                  id="register-btn-back-landing"
                  onClick={onBackToLanding}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Landing</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Step into adaptive learning powered by your personal cognitive twin.
            </p>

            {/* Role Selection Segmented Control */}
            <div className="mt-5 p-1 bg-slate-100 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1">
              <button
                type="button"
                id="register-role-student"
                onClick={() => setRole('STUDENT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'STUDENT'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Student Learner</span>
              </button>
              <button
                type="button"
                id="register-role-teacher"
                onClick={() => setRole('TEACHER')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'TEACHER'
                    ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-4 h-4 text-purple-600" />
                <span>Educator / Teacher</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="register-input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={role === 'STUDENT' ? 'Siva Vignesh' : 'Dr. R. Ramakrishnan'}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 placeholder-slate-400 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="register-input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="learner@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 placeholder-slate-400 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-input-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
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

              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="register-checkbox-terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    I agree to the continuous cognitive modeling & privacy policy. My data is used solely to calibrate my adaptive learning twin.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="register-btn-submit"
                disabled={loading || !agreeTerms}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Initializing Profile...' : 'Create Account & Setup Twin'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <button
              onClick={onNavigateLogin}
              id="register-btn-to-login"
              className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
            >
              Sign In Instead
            </button>
          </div>
        </div>

        {/* Right Graphic Banner in Clean Professional Light Theme */}
        <div className="md:col-span-5 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-slate-100 p-8 sm:p-10 text-slate-900 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-700 text-[10px] font-bold border border-purple-200 shadow-xs">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Instant Twin Initialization</span>
            </span>

            <h3 className="text-2xl font-black mt-6 leading-tight tracking-tight text-slate-900">
              Your Personal <br />
              Academic Twin <br />
              Awaits
            </h3>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              Upon registering, our 4-step wizard will calibrate your preferred learning modality, target milestones, and prerequisite graph.
            </p>
          </div>

          <div className="space-y-2 mt-8">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="text-[11px]">
                <div className="font-bold text-slate-800">Diagnostic Placement</div>
                <div className="text-slate-500">Zero-stakes baseline assessment</div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="text-[11px]">
                <div className="font-bold text-slate-800">Dynamic Knowledge Graph</div>
                <div className="text-slate-500">Autonomous prerequisite backtracking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
