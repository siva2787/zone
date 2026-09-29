import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  GitFork,
  MessageSquare,
  Milestone,
  CheckSquare,
  Clock,
  TrendingUp,
  Target,
  Bell,
  Settings,
  Users,
  AlertOctagon,
  BarChart3,
  Lightbulb,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../../types.ts';

interface SidebarProps {
  currentScreen: string;
  role: UserRole;
  onNavigate: (screen: string) => void;
  activeGapsCount?: number;
  unreadNotifications?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  role,
  onNavigate,
  activeGapsCount = 3,
  unreadNotifications = 2,
  onLogout,
}) => {
  const studentItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learning-twin', label: 'My Learning Twin', icon: Sparkles, highlight: true },
    { id: 'knowledge-graph', label: 'Knowledge Graph', icon: GitFork },
    { id: 'knowledge-gaps', label: 'Knowledge Gaps', icon: AlertOctagon, badge: activeGapsCount > 0 ? activeGapsCount : undefined },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare, badge: undefined },
    { id: 'learning-path', label: 'Learning Path', icon: Milestone },
    { id: 'assessments', label: 'Assessments', icon: CheckSquare },
    { id: 'retention', label: 'Retention & Revision', icon: Clock },
    { id: 'progress', label: 'Progress & Analytics', icon: TrendingUp },
    { id: 'goals', label: 'Learning Goals', icon: Target },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const teacherItems = [
    { id: 'teacher-dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
    { id: 'class-twins', label: 'Class Learning Twins', icon: Users, highlight: true },
    { id: 'student-insights', label: 'Student Insights', icon: Lightbulb },
    { id: 'gap-analytics', label: 'Knowledge Gap Analytics', icon: GitFork },
    { id: 'interventions', label: 'Intervention Center', icon: AlertOctagon, badge: '4 Alerts' },
    { id: 'teacher-analytics', label: 'Teacher Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const items = role === 'TEACHER' ? teacherItems : studentItems;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 min-h-[calc(100vh-6.5rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-4">
        {/* Main Portal Section */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {role === 'TEACHER' ? 'Teacher Portal' : 'Learner Portal'}
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${isActive
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${typeof item.badge === 'number'
                      ? 'bg-rose-100 text-rose-700'
                      : false
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-amber-100 text-amber-800'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Twin Status Card in Sidebar */}
      <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-[11px] font-bold text-indigo-100 uppercase tracking-wide">
            Twin Active Sync
          </span>
        </div>
        <p className="text-[11px] text-indigo-200 leading-relaxed">
          Continuously modeling mastery, retention, and prerequisite gaps.
        </p>
        <button
          onClick={() => onNavigate('learning-twin')}
          className="mt-3 w-full py-1.5 px-2.5 bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold rounded-lg text-center transition-colors border border-white/10"
        >
          Inspect Twin Model →
        </button>
      </div>

      {/* User Session & Logout Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2.5 text-left group hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/10 group-hover:ring-indigo-500/30 transition-all">
            {role === 'TEACHER' ? 'F' : 'S'}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {role === 'TEACHER' ? 'Faculty Admin' : 'Siva (Student)'}
            </div>
            <div className="text-[10px] text-slate-400">Settings & Security</div>
          </div>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out of Account"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};