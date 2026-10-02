import React, { useState } from 'react';
import { Search, Bell, Sparkles, Radio, Shield, Check, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const { soundEnabled, toggleSound } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(user?.status || 'online');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/messages?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const statusOptions = [
    { label: 'Online', value: 'online', color: 'bg-emerald-500' },
    { label: 'Idle / Away', value: 'idle', color: 'bg-amber-500' },
    { label: 'Do Not Disturb', value: 'dnd', color: 'bg-rose-500' },
    { label: 'Invisible', value: 'offline', color: 'bg-slate-500' },
  ];

  return (
    <header className="h-16 bg-vyntra-card/80 backdrop-blur-md border-b border-vyntra-border/60 px-6 flex items-center justify-between z-20">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-72 md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages, channels, games, AI docs... (Press ↵)"
          className="w-full bg-vyntra-surface/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-vyntra-accent/60 focus:ring-1 focus:ring-vyntra-accent/40 transition-all"
        />
      </form>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Live Broadcast Badge */}
        <button
          onClick={() => navigate('/app/live')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/10 to-indigo-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400 hover:scale-105 transition-transform"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Live Studio</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          className="p-2 rounded-xl bg-vyntra-surface/40 hover:bg-vyntra-surface text-slate-400 hover:text-white border border-white/5 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/app/notifications')}
          className="relative p-2 rounded-xl bg-vyntra-surface/40 hover:bg-vyntra-surface text-slate-400 hover:text-white border border-white/5 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-vyntra-surface/40 hover:bg-vyntra-surface border border-white/5 transition-colors"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${
              currentStatus === 'online' ? 'bg-emerald-500' :
              currentStatus === 'idle' ? 'bg-amber-500' :
              currentStatus === 'dnd' ? 'bg-rose-500' : 'bg-slate-500'
            }`} />
            <span className="text-xs text-slate-300 capitalize hidden md:inline">{currentStatus}</span>
          </button>

          {statusMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 py-1 bg-vyntra-card border border-vyntra-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-vyntra-border/60 text-[11px] font-semibold text-slate-400">
                Set Presence
              </div>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setCurrentStatus(opt.value);
                    setStatusMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-vyntra-surface flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                    {opt.label}
                  </span>
                  {currentStatus === opt.value && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
