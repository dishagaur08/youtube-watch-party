import React, { useState, useEffect } from 'react';
import { 
  Hash, 
  Volume2, 
  Plus, 
  Users, 
  ShieldCheck, 
  Send, 
  Settings, 
  Radio, 
  Sparkles,
  Search,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import api from '../services/api';

const CommunitiesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [communities, setCommunities] = useState([]);
  const [activeComm, setActiveComm] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [channelMessages, setChannelMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await api.get('/communities');
        if (res.data?.success) {
          setCommunities(res.data.data);
          if (res.data.data.length > 0) {
            const first = res.data.data[0];
            setActiveComm(first);
            setChannels(first.channels || []);
            if (first.channels && first.channels.length > 0) {
              setActiveChannel(first.channels[0]);
            }
          }
        }
      } catch (err) {
        console.error('Fetch communities error:', err);
      }
    };
    fetchCommunities();
  }, []);

  const handleSelectCommunity = (comm) => {
    setActiveComm(comm);
    setChannels(comm.channels || []);
    if (comm.channels && comm.channels.length > 0) {
      setActiveChannel(comm.channels[0]);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    try {
      const res = await api.post('/communities', {
        name: newCommName.trim(),
        description: newCommDesc.trim(),
      });
      if (res.data?.success) {
        setCommunities(prev => [...prev, res.data.data]);
        setActiveComm(res.data.data);
        setChannels(res.data.data.channels || []);
        setActiveChannel(res.data.data.channels?.[0]);
        setShowCreateModal(false);
        setNewCommName('');
        setNewCommDesc('');
      }
    } catch (err) {
      console.error('Create community error:', err);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChannel) return;
    const newMsg = {
      _id: 'cmsg_' + Date.now(),
      sender: user?._id || user?.id,
      senderDetail: user,
      content: inputText.trim(),
      createdAt: new Date(),
    };
    setChannelMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* 1. Server Icons Strip */}
      <div className="w-18 bg-vyntra-bg/90 border-r border-vyntra-border/60 py-4 px-2 flex flex-col items-center gap-3 overflow-y-auto">
        {communities.map((comm) => {
          const isSelected = activeComm?._id === comm._id;
          return (
            <button
              key={comm._id}
              onClick={() => handleSelectCommunity(comm)}
              className={`w-12 h-12 rounded-2xl relative group transition-all duration-300 ${
                isSelected
                  ? 'rounded-2xl ring-2 ring-indigo-500 shadow-glow-sm scale-105'
                  : 'rounded-3xl hover:rounded-2xl hover:bg-vyntra-surface'
              }`}
              title={comm.name}
            >
              <img
                src={comm.icon}
                alt={comm.name}
                className="w-full h-full rounded-[inherit] object-cover"
              />
              {isSelected && (
                <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-400 rounded-r-full" />
              )}
            </button>
          );
        })}

        {/* Add Server Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-3xl hover:rounded-2xl bg-vyntra-card hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all hover:scale-105"
          title="Create Community"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* 2. Community Channels Sidebar */}
      <div className="w-60 bg-vyntra-card/50 border-r border-vyntra-border/60 flex flex-col h-full">
        {/* Community Header */}
        <div className="p-4 border-b border-vyntra-border/60 flex items-center justify-between shadow-sm">
          <h3 className="font-bold text-sm text-white truncate">{activeComm?.name || 'Communities'}</h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            {activeComm?.memberCount || 1} M
          </span>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Channels</p>
            {channels.map((chan) => {
              const isSelected = activeChannel?._id === chan._id;
              const isVoice = chan.type === 'voice';
              return (
                <button
                  key={chan._id}
                  onClick={() => setActiveChannel(chan)}
                  className={`w-full px-2.5 py-2 rounded-xl flex items-center gap-2.5 text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-vyntra-accent/15 text-white border border-vyntra-accent/30 shadow-glow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-vyntra-surface/40'
                  }`}
                >
                  {isVoice ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <Hash className="w-4 h-4 text-indigo-400" />}
                  <span className="truncate">{chan.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Channel Chat / Voice Room View */}
      <div className="flex-1 flex flex-col h-full bg-vyntra-bg/30 min-w-0">
        {activeChannel ? (
          <>
            {/* Channel Top Header */}
            <div className="h-16 px-6 border-b border-vyntra-border/60 bg-vyntra-card/40 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {activeChannel.type === 'voice' ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <Hash className="w-5 h-5 text-indigo-400" />}
                <div>
                  <h3 className="font-bold text-sm text-white">{activeChannel.name}</h3>
                  <p className="text-[11px] text-slate-400">{activeComm?.description || 'Community Channel'}</p>
                </div>
              </div>
            </div>

            {/* Channel Content */}
            {activeChannel.type === 'voice' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-sm">
                  <Volume2 className="w-12 h-12" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-bold text-white">Voice Lounge: {activeChannel.name}</h3>
                  <p className="text-xs text-slate-400">High-Fidelity 64-kbps Spatial Audio Channel</p>
                </div>
                <button
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                >
                  <Radio className="w-4 h-4" />
                  <span>Connect to Voice</span>
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full">
                {/* Message stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-vyntra-card/50 border border-white/5 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Hash className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-white">Welcome to #{activeChannel.name}!</h3>
                    <p className="text-xs text-slate-400">This is the start of the #{activeChannel.name} channel in {activeComm?.name}.</p>
                  </div>

                  {channelMessages.map((msg) => (
                    <div key={msg._id} className="flex items-start gap-3">
                      <img
                        src={msg.senderDetail?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vyntra'}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full object-cover mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{msg.senderDetail?.displayName || 'User'}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Today at 12:45 PM</span>
                        </div>
                        <p className="text-xs text-slate-200">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input bar */}
                <div className="p-4 border-t border-vyntra-border/60 bg-vyntra-card/80">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message #${activeChannel.name}...`}
                      className="flex-1 bg-vyntra-surface/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-glow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a channel to enter
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateCommunity} className="max-w-md w-full bg-vyntra-card border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Your Community</h3>
            <p className="text-xs text-slate-400">Build a place for your friends, gaming squad, or developer team.</p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Community Name</label>
              <input
                type="text"
                required
                value={newCommName}
                onChange={(e) => setNewCommName(e.target.value)}
                placeholder="e.g. Cyberpunk Gamers"
                className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Description</label>
              <textarea
                value={newCommDesc}
                onChange={(e) => setNewCommDesc(e.target.value)}
                placeholder="What is your community about?"
                className="w-full bg-vyntra-surface/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
              />
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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow-sm"
              >
                Create Server
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;
