import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Bell,
  Search,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  Home,
  LogIn,
  UserPlus,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  ChevronDown,
  X,
  GitFork,
} from 'lucide-react';
import { User } from '../../types.ts';

interface NavbarProps {
  user: User | null;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onSwitchRole: (role: 'STUDENT' | 'TEACHER') => void;
  onTriggerDemoGap: () => void;
  onResolveDemoGap: () => void;
  onResetDemo: () => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentScreen,
  onNavigate,
  onSwitchRole,
  onTriggerDemoGap,
  onResolveDemoGap,
  onResetDemo,
  onLogout,
  unreadCount = 2,
}) => {
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showPagesMenu, setShowPagesMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState(0); // 0 = not started, 1-4 = completed through that step
  const navRef = useRef<HTMLElement>(null);

  // Close any open dropdown on outside click or Escape — previously there was
  // no way to dismiss the Demo Scenario panel except re-clicking its own
  // trigger button, which wasn't obvious mid-demo.
  useEffect(() => {
    const closeAll = () => {
      setShowDemoMenu(false);
      setShowPagesMenu(false);
      setShowUserMenu(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleTriggerGap = async () => {
    setDemoStatus('Triggering Conditional Probability gap...');
    await onTriggerDemoGap();
    setDemoStep(1);
    setTimeout(() => {
      setDemoStatus('Gap Activated! Check Dashboard & Knowledge Graph');
      setTimeout(() => setDemoStatus(null), 3000);
    }, 400);
  };

  const handleResolveGap = async () => {
    setDemoStatus('Resolving gap via mastery update...');
    await onResolveDemoGap();
    setDemoStep(3);
    setTimeout(() => {
      setDemoStatus('Conditional Probability Mastered (88%)! Twin & Graph updated.');
      setTimeout(() => setDemoStatus(null), 3000);
    }, 400);
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-indigo-100/70 shadow-xs">
      {/* Top Tagline Bar from Reference */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white text-xs py-1.5 px-4 sm:px-6 flex justify-between items-center tracking-wide">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-indigo-500/30 text-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-400/30">
            YUVA MEGATHON
          </span>
          <span className="hidden sm:inline text-indigo-200">
            Understand &nbsp;|&nbsp; Learn &nbsp;|&nbsp; Grow &nbsp;|&nbsp; Never Forget
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-purple-200 italic">
            "Every Learner, A Brighter Tomorrow"
          </span>
        </div>
      </div>

      {/* Main Nav Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-900 bg-clip-text text-transparent tracking-tight">
                LearnTwin
              </span>
              <span className="text-xl font-bold text-indigo-600">AI</span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 tracking-tight -mt-1 hidden sm:block">
              Your Learning Twin. A Smarter You.
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts, topics, or ask tutor..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/70 border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Flow Switcher: Landing, Login, Register, Onboarding */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPagesMenu(!showPagesMenu);
                setShowDemoMenu(false);
              }}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full transition-all shadow-xs"
              title="Jump directly between Entry Pages and Portals"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Flow / Pages</span>
            </button>

            {showPagesMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-2">
                  Entry & Onboarding Flow
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onNavigate('landing');
                      setShowPagesMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${currentScreen === 'landing' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <Home className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div>1. Landing Page</div>
                      <div className="text-[10px] font-normal text-slate-400">Hero, closed-loop engine & twin showcase</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('login');
                      setShowPagesMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${currentScreen === 'login' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <LogIn className="w-4 h-4 text-purple-600" />
                    <div>
                      <div>2. Login Page</div>
                      <div className="text-[10px] font-normal text-slate-400">Sign in & 1-click evaluation personas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('register');
                      setShowPagesMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${currentScreen === 'register' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div>3. Register Page</div>
                      <div className="text-[10px] font-normal text-slate-400">Create new account & choose student/educator</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate('onboarding');
                      setShowPagesMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors ${currentScreen === 'onboarding' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <div>
                      <div>4. Student Onboarding Wizard</div>
                      <div className="text-[10px] font-normal text-slate-400">4-step profile, subjects, modality & goals</div>
                    </div>
                  </button>

                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowPagesMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Back to Main Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Demo Scenario Controller Pill (For competition judges) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDemoMenu(!showDemoMenu);
                setShowPagesMenu(false);
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-full transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Demo Scenario</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Yuva Megathon Closed Loop
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onResetDemo();
                        setDemoStep(0);
                      }}
                      title="Reset to pristine initial seed"
                      className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                    <button
                      onClick={() => setShowDemoMenu(false)}
                      title="Close"
                      aria-label="Close demo scenario panel"
                      className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1 -mr-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Walk judges through the AI closed-loop live: a real prerequisite gap is
                  detected, the AI tutor explains it with full twin context, and
                  resolving it updates mastery everywhere in real time.
                </p>

                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      handleTriggerGap();
                      onNavigate('knowledge-gaps');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-amber-950">1. Trigger Prerequisite Gap</div>
                        <div className="text-[10px] text-amber-700">Bayes (38%) + Cond. Prob (45%) — opens Knowledge Gaps</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </button>

                  <button
                    onClick={() => {
                      setDemoStep((s) => Math.max(s, 2));
                      onNavigate('tutor');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-indigo-950">2. Open AI Tutor</div>
                        <div className="text-[10px] text-indigo-700">Explains the gap using twin context — try "Quiz Me"</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  <button
                    onClick={() => {
                      handleResolveGap();
                      onNavigate('learning-twin');
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-emerald-950">3. Resolve Gap via Mastery</div>
                        <div className="text-[10px] text-emerald-700">Mastery jumps to 88% — opens My Learning Twin</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => {
                      setDemoStep(4);
                      onNavigate('knowledge-graph');
                    }}
                    disabled={demoStep < 3}
                    className="w-full text-left p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 transition-colors flex items-center justify-between text-xs disabled:opacity-40 disabled:hover:bg-purple-50/70"
                  >
                    <div className="flex items-center gap-2">
                      <GitFork className="w-4 h-4 text-purple-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-purple-950">4. See It Ripple Through the Graph</div>
                        <div className="text-[10px] text-purple-700">Prerequisite edge clears live in the Knowledge Graph</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                </div>

                {demoStatus && (
                  <div className="mt-3 p-2 bg-indigo-950 text-white rounded-lg text-[10px] text-center font-medium animate-pulse">
                    {demoStatus}
                  </div>
                )}

                <button
                  onClick={() => setShowDemoMenu(false)}
                  className="mt-3 w-full text-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 py-1.5"
                >
                  Close panel
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher (Student / Teacher) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
            <button
              onClick={() => onSwitchRole('STUDENT')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all ${user?.role === 'STUDENT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Student
            </button>
            <button
              onClick={() => onSwitchRole('TEACHER')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-full transition-all ${user?.role === 'TEACHER'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Teacher
            </button>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => onNavigate('notifications')}
            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* User Avatar & Menu */}
          <div className="relative">
            <div
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowDemoMenu(false);
                setShowPagesMenu(false);
              }}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all">
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  {user?.name || 'Siva'}
                  {user?.role === 'TEACHER' && (
                    <UserCheck className="w-3 h-3 text-purple-600 inline" />
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  {user?.role === 'STUDENT' ? 'AI & Data Science' : 'Faculty Admin'}
                </div>
              </div>
            </div>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-800">{user?.name || 'Siva'}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user?.email || 'siva@example.com'}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {user?.role === 'TEACHER' ? 'Instructor Portal' : 'Student Learner'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-500" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate(user?.role === 'TEACHER' ? 'class-twins' : 'learning-twin');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{user?.role === 'TEACHER' ? 'Class Learning Twins' : 'My Learning Twin'}</span>
                </button>

                {onLogout && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};