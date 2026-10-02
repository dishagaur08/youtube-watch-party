import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Users, 
  PhoneCall, 
  Radio, 
  Gamepad2, 
  Tv, 
  Sparkles, 
  FileText, 
  Bookmark, 
  Bell, 
  Settings, 
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: '/app', icon: Home, label: 'Feed & Hub', exact: true },
    { to: '/app/messages', icon: MessageSquare, label: 'Messages', badge: 2 },
    { to: '/app/communities', icon: Users, label: 'Communities' },
    { to: '/app/calls', icon: PhoneCall, label: 'Calls' },
    { to: '/app/live', icon: Radio, label: 'Live Stream', pulse: true },
    { to: '/app/games', icon: Gamepad2, label: 'Arcade & Games' },
    { to: '/app/watch', icon: Tv, label: 'Watch Together' },
    { to: '/app/ai', icon: Sparkles, label: 'AI Co-Pilot', glow: true },
    { to: '/app/docs', icon: FileText, label: 'Document RAG' },
    { to: '/app/saved', icon: Bookmark, label: 'Saved Items' },
    { to: '/app/notifications', icon: Bell, label: 'Notifications' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', icon: ShieldAlert, label: 'Admin Command', admin: true });
  }

  return (
    <aside className="w-20 md:w-64 bg-vyntra-card border-r border-vyntra-border/60 flex flex-col justify-between py-5 px-3 z-30 select-none transition-all duration-300">
      <div>
        {/* Brand Logo */}
        <NavLink to="/app" className="flex items-center gap-3 px-3 py-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-glow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-vyntra-bg rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">V</span>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="font-bold text-xl tracking-wider text-white">VYNTRA</span>
            <span className="block text-[10px] text-vyntra-cyan font-mono tracking-widest uppercase">Connect • Play</span>
          </div>
        </NavLink>

        {/* Navigation links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-vyntra-accent/15 text-white border border-vyntra-accent/30 shadow-glow-sm' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-vyntra-surface/50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-vyntra-accentLight' : item.glow ? 'text-cyan-400' : 'text-slate-400'
                  }`} />
                  {item.pulse && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </div>

                <span className="hidden md:inline truncate">{item.label}</span>

                {item.badge && (
                  <span className="hidden md:inline-flex ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
                {item.glow && (
                  <span className="hidden md:inline-flex ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Settings */}
      <div className="pt-4 border-t border-vyntra-border/60 space-y-2">
        <NavLink
          to="/app/settings"
          className="flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-vyntra-surface/50 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="hidden md:inline">Settings</span>
        </NavLink>

        {/* User Mini Profile */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-vyntra-surface/30 border border-white/5">
          <NavLink to="/app/profile" className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <img 
                src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vyntra'} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-vyntra-bg" />
            </div>
            <div className="hidden md:block truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.displayName || user?.username || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">@{user?.username || 'guest'}</p>
            </div>
          </NavLink>

          <button 
            onClick={logout}
            title="Log Out"
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
