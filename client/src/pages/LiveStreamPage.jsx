import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Users, 
  Heart, 
  Send, 
  Sparkles, 
  Share2, 
  Plus, 
  MessageSquare,
  ShieldAlert,
  Flame,
  Tv
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import api from '../services/api';

const LiveStreamPage = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [streams, setStreams] = useState([]);
  const [activeStream, setActiveStream] = useState(null);
  const [liveChatMessages, setLiveChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamCategory, setStreamCategory] = useState('Gaming');

  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await api.get('/streams');
        if (res.data?.success) {
          setStreams(res.data.data);
          if (res.data.data.length > 0) {
            setActiveStream(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Fetch streams error:', err);
      }
    };
    fetchStreams();
  }, []);

  useEffect(() => {
    if (!socket || !activeStream) return;

    socket.emit('stream:join', { streamId: activeStream._id });

    const handleStreamMessage = (msg) => {
      setLiveChatMessages(prev => [...prev, msg]);
    };

    const handleFloatingReaction = ({ emoji, id }) => {
      setFloatingReactions(prev => [...prev, { emoji, id, x: Math.random() * 80 + 10 }]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== id));
      }, 2000);
    };

    const handleViewerUpdate = ({ viewerCount }) => {
      setActiveStream(prev => prev ? { ...prev, viewerCount } : prev);
    };

    socket.on('stream:chat-message', handleStreamMessage);
    socket.on('stream:floating-reaction', handleFloatingReaction);
    socket.on('stream:viewers', handleViewerUpdate);

    return () => {
      socket.emit('stream:leave', { streamId: activeStream._id });
      socket.off('stream:chat-message', handleStreamMessage);
      socket.off('stream:floating-reaction', handleFloatingReaction);
      socket.off('stream:viewers', handleViewerUpdate);
    };
  }, [socket, activeStream]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveChatMessages]);

  const handleSendChat = () => {
    if (!chatInput.trim() || !activeStream || !socket) return;
    socket.emit('stream:message', {
      streamId: activeStream._id,
      userId: user?._id || user?.id,
      message: chatInput.trim(),
    });
    setChatInput('');
  };

  const handleSendReaction = (emoji) => {
    if (!socket || !activeStream) return;
    socket.emit('stream:reaction', {
      streamId: activeStream._id,
      emoji,
      username: user?.displayName || user?.username,
    });
  };

  const handleStartStream = async (e) => {
    e.preventDefault();
    if (!streamTitle.trim()) return;

    try {
      const res = await api.post('/streams', {
        title: streamTitle.trim(),
        category: streamCategory,
      });
      if (res.data?.success) {
        setStreams(prev => [res.data.data, ...prev]);
        setActiveStream(res.data.data);
        setShowCreateModal(false);
        setStreamTitle('');
      }
    } catch (err) {
      console.error('Start stream error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full select-none">
      {/* Top Banner & Go Live Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-vyntra-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>VYNTRA Live Arena</span>
          </h2>
          <p className="text-xs text-slate-400">Low-latency WebRTC streams, live chat & creator analytics</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-indigo-600 to-rose-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow-sm transition-all hover:scale-105"
        >
          <Radio className="w-4 h-4" />
          <span>Start Broadcasting</span>
        </button>
      </div>

      {/* Main Streaming Showcase */}
      {activeStream && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream Video Feed Container */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
              {/* Stream Video Simulation / WebRTC Feed */}
              <img
                src={activeStream.thumbnail}
                alt={activeStream.title}
                className="w-full h-full object-cover"
              />

              {/* Floating Live Reactions Layer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingReactions.map((r) => (
                  <span
                    key={r.id}
                    style={{ left: `${r.x}%` }}
                    className="absolute bottom-6 text-3xl animate-float"
                  >
                    {r.emoji}
                  </span>
                ))}
              </div>

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-rose-600 px-3 py-1 rounded-xl text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono text-white flex items-center gap-1.5 border border-white/10">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeStream.viewerCount} Viewers</span>
                </span>
              </div>

              {/* Stream Reaction Toolbar Over Video */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                {['🔥', '❤️', '👏', '🚀', '♟️'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="text-lg p-1.5 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream Metadata & Author */}
            <div className="p-5 rounded-2xl bg-vyntra-card border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeStream.streamerDetail?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=streamer'}
                  alt="Streamer"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500"
                />
                <div>
                  <h3 className="font-bold text-base text-white">{activeStream.title}</h3>
                  <p className="text-xs text-slate-400">
                    {activeStream.streamerDetail?.displayName || 'Streamer'} • Category: <strong className="text-indigo-400">{activeStream.category}</strong>
                  </p>
                </div>
              </div>

              <button className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors">
                + Follow Streamer
              </button>
            </div>
          </div>

          {/* Live Chat Column */}
          <div className="h-[520px] bg-vyntra-card rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-vyntra-border/60 flex items-center justify-between">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Live Stream Chat</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-400">Slow mode: 3s</span>
            </div>

            {/* Live messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-slate-400">
                Welcome to live stream chat! Keep it friendly and abide by VYNTRA community guidelines.
              </div>

              {liveChatMessages.map((msg) => (
                <div key={msg.id} className="text-xs space-y-0.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-300">{msg.user?.displayName || msg.user?.username}:</span>
                    <span className="text-slate-200">{msg.message}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-vyntra-border/60 bg-vyntra-surface/40 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Send message to stream..."
                className="flex-1 bg-vyntra-bg border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendChat}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream Grid: Explore All Streams */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-white">More Active Streams</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {streams.map((s) => (
            <div
              key={s._id}
              onClick={() => setActiveStream(s)}
              className={`bg-vyntra-card rounded-2xl overflow-hidden border transition-all cursor-pointer group ${
                activeStream?._id === s._id ? 'border-indigo-500 shadow-glow-sm' : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="relative h-40">
                <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-2 left-2 bg-rose-600 px-2 py-0.5 rounded text-[10px] font-bold text-white">LIVE</div>
                <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                  {s.viewerCount} Viewers
                </div>
              </div>
              <div className="p-3.5 space-y-1">
                <h4 className="font-bold text-xs text-white line-clamp-1">{s.title}</h4>
                <p className="text-[11px] text-slate-400">{s.streamerDetail?.displayName || 'Streamer'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleStartStream} className="max-w-md w-full bg-vyntra-card border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500" />
              <span>Go Live Studio</span>
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Stream Title</label>
              <input
                type="text"
                required
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="e.g. Speedrunning High-ELO Chess Matches"
                className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <select
                value={streamCategory}
                onChange={(e) => setStreamCategory(e.target.value)}
                className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Gaming">Gaming</option>
                <option value="Tech & AI">Tech & AI</option>
                <option value="Music">Music</option>
                <option value="Just Chatting">Just Chatting</option>
                <option value="Esports">Esports</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-sm"
              >
                Start Stream
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveStreamPage;
