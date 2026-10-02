import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  Gamepad2, 
  Radio, 
  Tv, 
  ShieldCheck, 
  Bot, 
  Zap, 
  Users, 
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async () => {
    await loginAsDemo('user');
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-vyntra-bg text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-violet-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-violet-600/10 blur-3xl pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-glow-sm flex items-center justify-center">
            <div className="w-full h-full bg-vyntra-bg rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">W</span>
            </div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-wider text-white">WatchTogether</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] text-cyan-400 font-mono tracking-widest uppercase">YouTube Watch Party</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#realtime" className="hover:text-white transition-colors">Real-Time</a>
          <a href="#ai" className="hover:text-white transition-colors">AI Intelligence</a>
          <a href="#gaming" className="hover:text-white transition-colors">Gaming & Stream</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickDemo}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-all"
          >
            Instant Demo
          </button>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-glow-sm transition-all hover:scale-105"
          >
            Launch Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-violet-500/15 to-cyan-500/15 border border-indigo-500/30 text-xs font-medium text-indigo-300 mb-8 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Watch YouTube together in real time.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
          Watch YouTube <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300">
            together in real time.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          A unified ecosystem combining real-time synchronized YouTube watch parties, role-based controls, seek sync, live room chat, and interactive reactions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-glow-md flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={handleQuickDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-vyntra-card hover:bg-vyntra-cardHover text-slate-200 font-semibold text-sm border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 text-cyan-400 fill-current" />
            <span>Explore Demo Session</span>
          </button>
        </div>

        {/* Live Interface Mockup Preview */}
        <div className="mt-16 relative rounded-3xl p-2 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <div className="bg-vyntra-card rounded-2xl overflow-hidden border border-white/5 p-4 sm:p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400">watchtogether.io / live-party</span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Live 60 FPS Grid
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Card 1: Real-Time Chat */}
              <div className="bg-vyntra-bg/70 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>Real-Time WebSockets</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-white/5 p-2 rounded-lg text-slate-300">
                    <span className="font-bold text-white">@alex:</span> Up for a watch party session?
                  </div>
                  <div className="bg-indigo-600/30 p-2 rounded-lg text-indigo-200 border border-indigo-500/30">
                    <span className="font-bold text-white">@you:</span> Yes! Room created on WatchTogether 🎬
                  </div>
                </div>
              </div>

              {/* Card 2: AI Co-Pilot */}
              <div className="bg-vyntra-bg/70 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Bot className="w-4 h-4" />
                  <span>AI Document RAG</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  "Based on Section 4 of Research_Doc.pdf, real-time WebSockets operate at sub-20ms latency."
                </p>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  Citation: Page 4, Paragraph 2
                </span>
              </div>

              {/* Card 3: Multiplayer Arcade */}
              <div className="bg-vyntra-bg/70 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Multiplayer Arcade</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Chess Blitz (3+0)</span>
                  <span className="text-emerald-400 font-mono font-bold">1680 ELO</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Unified Communication & Entertainment Architecture
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need in one cohesive platform. No separate apps, no clunky bridges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: MessageSquare,
              title: 'Ultra Low-Latency Chat',
              description: '1-to-1, group chats, Discord-style community channels, voice notes with waveform UI, media sharing, and instant emoji reactions.',
              color: 'text-indigo-400',
              border: 'hover:border-indigo-500/40',
            },
            {
              icon: Radio,
              title: 'WebRTC Calls & Live Streaming',
              description: 'Encrypted peer-to-peer voice and video calls, seamless screen sharing, active speaker detection, and low-latency broadcasting with live interactive chat.',
              color: 'text-rose-400',
              border: 'hover:border-rose-500/40',
            },
            {
              icon: Gamepad2,
              title: 'Real Multiplayer Arcade',
              description: 'Real-time state synchronization for Chess, Tic-Tac-Toe, Rock Paper Scissors, and Trivia Quiz with rating systems and global leaderboards.',
              color: 'text-violet-400',
              border: 'hover:border-violet-500/40',
            },
            {
              icon: Tv,
              title: 'Watch & Listen Together',
              description: 'Synchronize YouTube, media feeds, and audio playback across remote friend groups with zero drift and synchronized room chat.',
              color: 'text-cyan-400',
              border: 'hover:border-cyan-500/40',
            },
            {
              icon: Bot,
              title: 'AI Co-Pilot & Document RAG',
              description: 'Provider-agnostic AI assistant, smart replies, tone rewrites, multi-language translation, conversation summaries, and cited semantic document Q&A.',
              color: 'text-amber-400',
              border: 'hover:border-amber-500/40',
            },
            {
              icon: ShieldCheck,
              title: 'Enterprise-Grade Security',
              description: 'JWT token rotation, bcrypt password hashing, role-based access control (RBAC), rate limiting, and server-side content moderation.',
              color: 'text-emerald-400',
              border: 'hover:border-emerald-500/40',
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className={`bg-vyntra-card p-6 rounded-2xl border border-white/5 transition-all duration-300 hover:-translate-y-1 ${feat.border} group`}
              >
                <div className={`p-3 rounded-xl bg-white/5 w-fit mb-4 ${feat.color}`}>
                  <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-indigo-900/40 via-violet-900/40 to-cyan-900/40 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-glow-md">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Watch YouTube together in real time.
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Experience the synchronized power of WatchTogether today. Ready out-of-the-box with real-time sockets, seek sync, and role permissions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-glow-sm transition-all hover:scale-105"
            >
              Create Account Now
            </Link>
            <button
              onClick={handleQuickDemo}
              className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-all"
            >
              Try Instant Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>© 2026 WatchTogether. Watch YouTube together in real time. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
