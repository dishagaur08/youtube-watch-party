import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Volume2, 
  Key, 
  Smartphone, 
  Moon, 
  Check, 
  Lock,
  Globe
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { soundEnabled, toggleSound } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [allowDMs, setAllowDMs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full select-none">
      <div className="pb-4 border-b border-vyntra-border/60">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>System Settings & Preferences</span>
        </h2>
        <p className="text-xs text-slate-400">Configure appearance, notifications, security & privacy controls</p>
      </div>

      <div className="space-y-6">
        {/* Appearance & Sound */}
        <div className="p-6 rounded-3xl bg-vyntra-card border border-white/5 space-y-4 shadow-lg">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Audio & Feedback</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-vyntra-surface/40 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">System & Message Sound Effects</p>
              <p className="text-[11px] text-slate-400">Play subtle audio on new messages, call rings, and moves</p>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                soundEnabled ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-3xl bg-vyntra-card border border-white/5 space-y-4 shadow-lg">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Push & Desktop Notifications</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-vyntra-surface/40 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Incoming Call & Mention Alerts</p>
              <p className="text-[11px] text-slate-400">Receive desktop push alerts when mentioned or called</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                notifications ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                notifications ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Security & 2FA */}
        <div className="p-6 rounded-3xl bg-vyntra-card border border-white/5 space-y-4 shadow-lg">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & Authentication</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-vyntra-surface/40 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-slate-400">Secure account with TOTP authenticator or email code</p>
            </div>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                twoFactor ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                twoFactor ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-vyntra-surface/40 border border-white/5">
            <div>
              <p className="text-xs font-bold text-white">Allow Direct Messages from Community Members</p>
              <p className="text-[11px] text-slate-400">Allow incoming DMs from mutual community channels</p>
            </div>
            <button
              onClick={() => setAllowDMs(!allowDMs)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                allowDMs ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                allowDMs ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences updated
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow-sm transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
