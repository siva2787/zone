import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Notification } from '../../types.ts';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'LEARNING' | 'PROGRESS' | 'REMINDER'>('ALL');

  const fetchNotifs = () => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((d) => setNotifications(d))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.category === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header from Screen 16 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Digital Twin Activity Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-slate-500">
            Real-time updates on prerequisite gap discoveries, scheduled revisions, and achievements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['ALL', 'LEARNING', 'PROGRESS', 'REMINDER'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filter === cat
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List (Screen 16 from Reference) */}
      <div className="space-y-3">
        {filtered.map((notif) => {
          return (
            <div
              key={notif.id}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !notif.read
                  ? 'bg-white border-indigo-200 shadow-xs ring-2 ring-indigo-500/10'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white ${
                  notif.type === 'GAP_ALERT'
                    ? 'bg-rose-500'
                    : notif.type === 'REVISION_DUE'
                    ? 'bg-amber-500'
                    : notif.type === 'MASTERY_UP'
                    ? 'bg-emerald-500'
                    : 'bg-indigo-600'
                }`}
              >
                {notif.type === 'GAP_ALERT' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : notif.type === 'REVISION_DUE' ? (
                  <Clock className="w-4 h-4" />
                ) : notif.type === 'MASTERY_UP' ? (
                  <Award className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
