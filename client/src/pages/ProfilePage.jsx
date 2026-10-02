import React, { useState } from 'react';
import { User, Mail, Shield, Sparkles, Edit3, Camera, Trophy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await updateProfile({ displayName, bio, customStatus });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full select-none">
      {/* Banner & Avatar Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-vyntra-card border border-white/10 shadow-2xl">
        {/* Banner */}
        <div className="h-44 bg-gradient-to-r from-indigo-900 via-violet-900 to-cyan-900 relative">
          <img
            src={user?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'}
            alt="Banner"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* User Info Bar */}
        <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4 -mt-16 sm:-mt-12">
            <div className="relative">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-vyntra-card shadow-2xl bg-vyntra-bg"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-vyntra-card" />
            </div>
            <div className="space-y-1 mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{user?.displayName || user?.username}</span>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono border border-violet-500/30">
                    Lead Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-mono">@{user?.username || 'user'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
            <span><strong>{(user?.friends || []).length}</strong> Friends</span>
            <span><strong>{(user?.followers || []).length}</strong> Followers</span>
            <span><strong>{(user?.following || []).length}</strong> Following</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="bg-vyntra-card rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-vyntra-border/60">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>Edit Profile Details</span>
          </h3>
          {saved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Changes saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Custom Status</label>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="e.g. In the zone 🎮"
              className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 h-24 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow-sm transition-all"
        >
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
