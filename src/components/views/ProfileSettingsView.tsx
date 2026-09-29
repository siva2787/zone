import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Settings,
  Brain,
  Sparkles,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Trash2,
  AlertTriangle,
  GraduationCap,
  Mail,
  Camera,
  Edit3,
  ShieldAlert,
} from 'lucide-react';
import { User as UserType, StudentProfile } from '../../types.ts';

interface ProfileSettingsViewProps {
  user: UserType | null;
  profile: StudentProfile | null;
  onUpdateName: (name: string) => void;
  onResetDatabase: () => void;
  onLogout?: () => void;
  onDeleteProfile?: () => void;
  onUpdateAvatar?: (avatarUrl: string) => Promise<void> | void;
}

const MAX_AVATAR_BYTES = 8 * 1024 * 1024; // source file cap (image gets downscaled before upload anyway)

const resizeImageToDataUrl = (file: File, maxDim = 256, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
};

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  user,
  profile,
  onUpdateName,
  onResetDatabase,
  onLogout,
  onDeleteProfile,
  onUpdateAvatar,
}) => {
  const [name, setName] = useState(user?.name || 'Siva');
  const [learningMode, setLearningMode] = useState(profile?.learningMode || 'Visual');
  const [department, setDepartment] = useState(profile?.department || 'AI & Data Science');
  const [yearSemester, setYearSemester] = useState(profile?.yearSemester || '3rd Year');
  const [selectedAvatarIcon, setSelectedAvatarIcon] = useState<string>('brain');

  const [savedMessage, setSavedMessage] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom uploaded profile photo (data URL). Falls back to the icon grid below when unset.
  const isCustomPhoto = (url?: string) => !!url && !url.includes('images.unsplash.com');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    isCustomPhoto(user?.avatarUrl) ? (user!.avatarUrl as string) : null
  );

  // The `user` prop arrives asynchronously (null on first mount, then populated once
  // /api/auth/current-user resolves). The useState initializer above only runs once,
  // so without this effect a page reload landing directly on this screen would show
  // no photo until some other state change happened to re-run it.
  useEffect(() => {
    setAvatarPreview(isCustomPhoto(user?.avatarUrl) ? (user!.avatarUrl as string) : null);
  }, [user?.avatarUrl]);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Same async-prop issue as avatarPreview: hydrate the editable text fields once
  // the real user/profile arrive (relevant when a reload lands directly on this screen).
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!hydratedRef.current && (user || profile)) {
      if (user?.name) setName(user.name);
      if (profile?.department) setDepartment(profile.department);
      if (profile?.yearSemester) setYearSemester(profile.yearSemester);
      if (profile?.learningMode) setLearningMode(profile.learningMode);
      hydratedRef.current = true;
    }
  }, [user, profile]);


  const handleAvatarButtonClick = () => {
    setAvatarError(null);
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so choosing the same file again still fires onChange
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('That photo is too large — please pick one under 2MB.');
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);
    const previousPreview = avatarPreview;

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarPreview(dataUrl);
      if (onUpdateAvatar) {
        await onUpdateAvatar(dataUrl);
      }
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarPreview(previousPreview);
      setAvatarError('Could not upload that photo. Please try a different image.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarPreview(null);
    setAvatarError(null);
    if (onUpdateAvatar) {
      await onUpdateAvatar('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(name);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDeleteProfile) {
        await onDeleteProfile();
      } else {
        await fetch('/api/auth/profile', { method: 'DELETE' });
        if (onLogout) onLogout();
      }
    } catch (err) {
      console.error('Failed to delete profile:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const avatarIcons = [
    { id: 'brain', icon: Brain, label: 'Cognitive' },
    { id: 'student', icon: GraduationCap, label: 'Academic' },
    { id: 'sparkles', icon: Sparkles, label: 'AI Twin' },
    { id: 'user', icon: User, label: 'Classic' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Learner Calibration & System Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Profile & Settings
          </h1>
          <p className="text-xs text-slate-500">
            Manage your profile, avatar icon, account parameters, and twin persistence.
          </p>
        </div>

        {/* Quick Header Log Out Action */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all shadow-xs group"
          title="Sign out of your active account session"
        >
          <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-700 transition-colors" />
          <span>Log Out</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile configuration saved and calibrated to Learning Twin!</span>
        </div>
      )}

      {/* Profile Avatar & Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10 text-center sm:text-left">
          {/* Avatar Display Icon / Uploaded Photo */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl ring-4 ring-white/10">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={`${name}'s profile`} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    {selectedAvatarIcon === 'brain' && <Brain className="w-12 h-12 text-indigo-400" />}
                    {selectedAvatarIcon === 'student' && <GraduationCap className="w-12 h-12 text-purple-400" />}
                    {selectedAvatarIcon === 'sparkles' && <Sparkles className="w-12 h-12 text-pink-400" />}
                    {selectedAvatarIcon === 'user' && <User className="w-12 h-12 text-indigo-300" />}
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAvatarButtonClick}
              disabled={avatarUploading}
              title="Upload a profile photo from your device"
              className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-500 border-2 border-slate-900 text-white rounded-full p-1.5 shadow-md transition-colors disabled:opacity-60 cursor-pointer"
            >
              {avatarUploading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold tracking-tight">{name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {user?.role === 'TEACHER' ? 'Faculty Member' : 'University Student'}
              </span>
            </div>
            <p className="text-xs text-indigo-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>{user?.email || 'siva@example.com'}</span>
            </p>
            <div className="text-[11px] text-indigo-300/80 pt-1">
              Department: <strong className="text-white">{department}</strong> • {yearSemester}
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-[11px] font-semibold text-indigo-300 hover:text-white underline underline-offset-2 pt-0.5"
              >
                Remove photo
              </button>
            )}
            {avatarError && (
              <div className="text-[11px] font-semibold text-rose-300 pt-0.5">{avatarError}</div>
            )}
          </div>
        </div>

        {/* Quick Avatar Icon Selection */}
        <div className="z-10 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 space-y-2 text-center sm:text-right w-full sm:w-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
            Choose Profile Icon
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            {avatarIcons.map((item) => {
              const IconComp = item.icon;
              const isSelected = !avatarPreview && selectedAvatarIcon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatarIcon(item.id);
                    if (avatarPreview) handleRemovePhoto();
                  }}
                  title={item.label}
                  className={`p-2 rounded-xl transition-all ${isSelected
                      ? 'bg-indigo-600 text-white shadow-md scale-110 ring-2 ring-white/50'
                      : 'bg-white/10 text-indigo-200 hover:bg-white/20'
                    }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          {avatarPreview && (
            <div className="text-[10px] text-indigo-300/80 text-center sm:text-right">
              Using uploaded photo — pick an icon to switch back
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>Personal Information & Account Details</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">User ID: {user?.id || 'usr_student_1'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'siva@example.com'}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year / Level</label>
              <input
                type="text"
                value={yearSemester}
                onChange={(e) => setYearSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Learning Twin Calibration */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cognitive Twin Tuning
            </h2>
            <p className="text-xs text-slate-500">
              How Gemini AI Tutor phrases analogies and formats explanations
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Visual', 'Practical', 'Theoretical', 'Interactive'] as const).map((mode) => (
              <div
                key={mode}
                onClick={() => setLearningMode(mode)}
                className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${learningMode === mode
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 font-semibold'
                  }`}
              >
                <div className="text-xs">{mode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Demo Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pristine Database Reset</h3>
            <p className="text-xs text-slate-500">
              Re-seed all 48 student twins, prerequisite graphs, and the Bayes Theorem scenario.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetDatabase}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Database Seed</span>
          </button>
        </div>

        {/* Danger Zone: Delete Profile */}
        <div className="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold">Danger Zone: Account & Profile Management</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full">
              Irreversible Action
            </span>
          </div>

          <p className="text-xs text-rose-700/80 leading-relaxed">
            Deleting your profile will permanently erase your AI Learning Twin cognitive model, prerequisite knowledge graphs, active retention schedules, and assessment logs.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[11px] font-semibold text-rose-800">
              Once deleted, your account cannot be recovered.
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Profile & Twin Data</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            Update & Save Profile
          </button>
        </div>
      </form>

      {/* Production Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 text-rose-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">Sign Out of LearnTwin?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You will be returned to the landing page. Your Learning Twin model state, mastery points, and retention schedules remain safely saved.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Sign Out</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600 animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Delete Account & Profile?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete profile <strong className="text-slate-900">{name}</strong>?
                This will permanently purge your Learning Twin model, knowledge graph, and user data.
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] font-semibold text-rose-900 leading-relaxed">
              ⚠️ Warning: This action cannot be undone. You will be signed out immediately and returned to the guest portal.
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting Profile...' : 'Confirm & Delete Profile Permanently'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel Keep My Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};