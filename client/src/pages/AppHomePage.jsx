import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  Gamepad2, 
  Radio, 
  Tv, 
  Bot, 
  Plus, 
  ArrowRight,
  Play,
  Flame,
  Users,
  Trophy,
  Zap,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AppHomePage = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [storiesRes, streamsRes, boardRes] = await Promise.all([
          api.get('/stories').catch(() => ({ data: { data: [] } })),
          api.get('/streams').catch(() => ({ data: { data: [] } })),
          api.get('/games/leaderboard').catch(() => ({ data: { data: [] } })),
        ]);
        setStories(storiesRes.data?.data || []);
        setLiveStreams(streamsRes.data?.data || []);
        setLeaderboard(boardRes.data?.data || []);
      } catch (err) {
        console.warn('Dashboard data note:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-900/50 via-violet-900/40 to-cyan-900/40 border border-indigo-500/30 overflow-hidden shadow-glow-sm">
        <div className="absolute right-0 top-0 w-96 h-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VYNTRA Grid 2026 Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Welcome back, {user?.displayName || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Real-time chat, multiplayer Chess & Arcade matchmaking, WebRTC low-latency streaming and AI Document RAG are synchronized and operational.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/app/messages"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Messages</span>
            </Link>
            <Link
              to="/app/games"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 border border-white/10 transition-all"
            >
              <Gamepad2 className="w-4 h-4 text-violet-400" />
              <span>Play Chess Blitz</span>
            </Link>
            <Link
              to="/app/ai"
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-2 border border-cyan-500/30 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Co-Pilot</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stories / Status Carousel */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Active Status & Stories</span>
        </h3>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {/* Add story button */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-vyntra-card border-2 border-dashed border-indigo-500/40 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
              <Plus className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Your Story</span>
          </div>

          {/* Sample stories */}
          {[
            { name: 'Disha Patel', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', unread: true },
            { name: 'Alex Rivers', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', unread: true },
            { name: 'Dr. Sarah Lin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', unread: false },
          ].map((st, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
              <div className={`w-16 h-16 rounded-2xl p-[2px] transition-transform group-hover:scale-105 ${
                st.unread ? 'bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400' : 'bg-vyntra-border'
              }`}>
                <img src={st.avatar} alt={st.name} className="w-full h-full rounded-[14px] object-cover" />
              </div>
              <span className="text-[11px] text-slate-300 font-medium truncate max-w-[70px]">{st.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Live Streams & Arcade Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Featured Live Streams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              <span>Live Broadcasts Right Now</span>
            </h3>
            <Link to="/app/live" className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {liveStreams.slice(0, 2).map((stream) => (
              <div
                key={stream._id}
                onClick={() => navigate('/app/live')}
                className="bg-vyntra-card rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group shadow-lg"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-rose-600 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-white flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>{stream.viewerCount}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-indigo-400 border border-white/5">
                    {stream.category}
                  </span>
                  <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {stream.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    By {stream.streamerDetail?.displayName || 'Streamer'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Arcade Leaderboard */}
        <div className="bg-vyntra-card rounded-3xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-vyntra-border/60">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Top Competitors</span>
            </h3>
            <Link to="/app/games" className="text-xs font-semibold text-indigo-400 hover:underline">
              Leaderboard
            </Link>
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, 4).map((player, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-vyntra-surface/30 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`w-5 font-mono font-bold text-xs ${
                    idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img
                    src={player.userDetail?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt="Player"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{player.userDetail?.displayName || 'Player'}</p>
                    <p className="text-[10px] text-slate-400">{player.wins} Wins • {player.totalPlayed} Matches</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                  {player.rating} ELO
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHomePage;
