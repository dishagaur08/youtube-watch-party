import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Play, 
  Pause, 
  Users, 
  Send, 
  Link as LinkIcon, 
  Plus, 
  Copy, 
  Check, 
  Search, 
  Shield, 
  Crown, 
  User, 
  Sparkles, 
  LogOut,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import YouTubeSyncPlayer from '../components/YouTubeSyncPlayer';
import ParticipantList from '../components/ParticipantList';

/**
 * YouTube URL / ID Helper
 * Extracts standard 11-char YouTube Video ID from any format (short, full, embed).
 */
const extractYouTubeId = (url) => {
  if (!url) return 'dQw4w9WgXcQ';
  const clean = url.trim();
  if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) return clean;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = clean.match(regExp);
  return (match && match[2].length === 11) ? match[2] : clean;
};

const WatchTogetherPage = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();

  // Watch Party Room & Sync State
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomTitle, setRoomTitle] = useState('YouTube Watch Party');
  const [videoId, setVideoId] = useState('dQw4w9WgXcQ');
  const [playState, setPlayState] = useState('PAUSED'); // 'PLAYING' | 'PAUSED'
  const [currentTime, setCurrentTime] = useState(0);
  const [userRole, setUserRole] = useState('Participant'); // 'Host' | 'Moderator' | 'Participant'
  const [participants, setParticipants] = useState([]);
  
  // UI & Interaction States
  const [videoInput, setVideoInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [notification, setNotification] = useState(null);

  const chatEndRef = useRef(null);
  const currentUserId = user?._id || user?.id || `guest_${Date.now()}`;
  const currentUsername = user?.displayName || user?.username || usernameInput || 'Friend';

  // Can current user control video playback?
  const canControl = userRole === 'Host' || userRole === 'Moderator';

  // Check URL query parameters for direct room join links (e.g. ?room=ROOM123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryRoom = params.get('room');
    if (queryRoom) {
      setRoomInput(queryRoom.toUpperCase());
    }
  }, []);

  // Socket.IO Event Subscriptions
  useEffect(() => {
    if (!socket) return;

    // 1. Initial State Sync
    const handleSyncState = (state) => {
      if (state.roomId) setRoomId(state.roomId);
      if (state.title) setRoomTitle(state.title);
      if (state.videoId) setVideoId(state.videoId);
      if (state.playState) setPlayState(state.playState);
      if (typeof state.currentTime === 'number') setCurrentTime(state.currentTime);
      if (state.role) setUserRole(state.role);
      if (state.participants) setParticipants(state.participants);
      setIsInRoom(true);
    };

    // 2. User Joined
    const handleUserJoined = (data) => {
      if (data.participants) setParticipants(data.participants);
      showToast(`${data.username} joined the party!`);
    };

    // 3. User Left
    const handleUserLeft = (data) => {
      if (data.participants) setParticipants(data.participants);
      showToast(`${data.username} left the party.`);
    };

    // 4. Role Assigned
    const handleRoleAssigned = (data) => {
      if (data.participants) setParticipants(data.participants);
      if (data.userId === currentUserId) {
        setUserRole(data.role);
        showToast(`Your role was updated to ${data.role}!`);
      } else {
        showToast(`${data.username} is now a ${data.role}.`);
      }
    };

    // 5. Participant Removed
    const handleParticipantRemoved = (data) => {
      if (data.participants) setParticipants(data.participants);
      showToast(`A participant was removed by host.`);
    };

    // 6. Kicked from room
    const handleKicked = (data) => {
      setIsInRoom(false);
      showToast(data.message || 'You were removed from the room.');
    };

    // 7. Room Chat Message
    const handleChatMessage = (msg) => {
      setChatMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    // 8. Room Reaction
    const handleReaction = (reaction) => {
      setFloatingReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2500);
    };

    // 9. Error Handler
    const handleError = (err) => {
      showToast(err.message || 'An error occurred', 'error');
    };

    socket.on('sync_state', handleSyncState);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('role_assigned', handleRoleAssigned);
    socket.on('participant_removed', handleParticipantRemoved);
    socket.on('kicked_from_room', handleKicked);
    socket.on('room_chat_message', handleChatMessage);
    socket.on('room_reaction', handleReaction);
    socket.on('error', handleError);

    return () => {
      socket.off('sync_state', handleSyncState);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('role_assigned', handleRoleAssigned);
      socket.off('participant_removed', handleParticipantRemoved);
      socket.off('kicked_from_room', handleKicked);
      socket.off('room_chat_message', handleChatMessage);
      socket.off('room_reaction', handleReaction);
      socket.off('error', handleError);
    };
  }, [socket, currentUserId]);

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Create or Join Room
  const handleJoinOrCreate = (targetRoomId) => {
    if (!socket) return;
    const finalRoomId = (targetRoomId || roomInput || `PARTY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`).trim().toUpperCase();

    socket.emit('join_room', {
      roomId: finalRoomId,
      username: currentUsername,
      userId: currentUserId,
      avatar: user?.avatar,
    });
  };

  const handleLeaveRoom = () => {
    if (!socket || !roomId) return;
    socket.emit('leave_room', { roomId });
    setIsInRoom(false);
    setRoomId('');
  };

  // Playback Control Triggers (Host / Moderator)
  const handlePlay = (time) => {
    if (!socket || !canControl) return;
    socket.emit('play');
  };

  const handlePause = (time) => {
    if (!socket || !canControl) return;
    socket.emit('pause', { currentTime: time });
  };

  const handleSeek = (time) => {
    if (!socket || !canControl) return;
    socket.emit('seek', { time });
  };

  const handleChangeVideo = (e) => {
    e.preventDefault();
    if (!videoInput.trim() || !socket || !canControl) return;

    const extractedId = extractYouTubeId(videoInput);
    socket.emit('change_video', { videoId: extractedId });
    setVideoInput('');
  };

  // Role Management Triggers (Host only)
  const handleAssignRole = (targetUserId, newRole) => {
    if (!socket || userRole !== 'Host') return;
    socket.emit('assign_role', { userId: targetUserId, role: newRole });
  };

  const handleRemoveParticipant = (targetUserId) => {
    if (!socket || userRole !== 'Host') return;
    socket.emit('remove_participant', { userId: targetUserId });
  };

  // Chat & Reactions
  const handleSendMessage = () => {
    if (!chatInput.trim() || !socket) return;
    socket.emit('room_chat_message', { message: chatInput.trim() });
    setChatInput('');
  };

  const handleSendReaction = (emoji) => {
    if (!socket) return;
    socket.emit('room_reaction', { emoji });
  };

  const copyRoomLink = () => {
    const shareUrl = `${window.location.origin}/watch?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Room link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full select-none relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'error' 
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-200' 
              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
          }`}>
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Floating Reactions Overlay */}
      <div className="fixed bottom-24 right-8 pointer-events-none z-50 flex flex-col items-center gap-2">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            className="animate-bounce text-3xl drop-shadow-glow"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* ROOM LOBBY SCREEN (WHEN NOT IN ROOM) */}
      {/* ---------------------------------------------------- */}
      {!isInRoom ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
          <div className="max-w-md w-full bg-vyntra-card border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center mx-auto shadow-glow-md">
              <Tv className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">YouTube Watch Party</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch YouTube videos together with synchronized playback, seek sync, role-based controls, and live chat.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {!user && (
                <div className="text-left space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Your Display Name</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-vyntra-bg border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="text-left space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Room Code (optional to join existing)</label>
                <input
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PARTY-4X9"
                  className="w-full bg-vyntra-bg border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono tracking-wider"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleJoinOrCreate()}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-sm transition-all hover:scale-105"
                >
                  {roomInput ? 'Join Watch Room' : 'Create New Room'}
                </button>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-[10px] text-slate-400">
              <div className="p-2 rounded-xl bg-white/5 flex flex-col items-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Host Roles</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Zero Drift</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>RBAC Guard</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* ACTIVE WATCH PARTY ROOM SCREEN */
        /* ---------------------------------------------------- */
        <div className="space-y-6">
          {/* Top Room Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-vyntra-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm flex-shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-wide">{roomTitle}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {roomId}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>Role:</span>
                  <span className={`font-bold ${
                    userRole === 'Host' ? 'text-amber-300' : userRole === 'Moderator' ? 'text-purple-300' : 'text-slate-300'
                  }`}>
                    {userRole}
                  </span>
                  <span>•</span>
                  <span>{participants.length} watching</span>
                </div>
              </div>
            </div>

            {/* Room Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={copyRoomLink}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all hover:scale-105"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copiedLink ? 'Copied' : 'Share Room'}</span>
              </button>

              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Party</span>
              </button>
            </div>
          </div>

          {/* Main Content Grid: Player & Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Player + Change Video Bar */}
            <div className="lg:col-span-2 space-y-4">
              <YouTubeSyncPlayer
                videoId={videoId}
                playState={playState}
                currentTime={currentTime}
                canControl={canControl}
                userRole={userRole}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
              />

              {/* YouTube Video URL Switcher Bar */}
              {canControl ? (
                <form onSubmit={handleChangeVideo} className="p-3 bg-vyntra-card border border-white/10 rounded-2xl flex items-center gap-2 shadow-lg">
                  <Search className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="Paste YouTube URL or Video ID to change video for everyone..."
                    className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-sm flex-shrink-0 transition-all"
                  >
                    Change Video
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Only Host and Moderators can change video or scrub playback.</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Sync Active</span>
                </div>
              )}

              {/* Reaction Bar */}
              <div className="flex items-center justify-between p-3 bg-vyntra-card border border-white/10 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Quick Reactions:</span>
                <div className="flex items-center gap-2">
                  {['🔥', '❤️', '👏', '😂', '🎉', '🤯'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendReaction(emoji)}
                      className="text-xl p-1.5 rounded-xl hover:bg-white/10 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Participant List + Live Room Chat */}
            <div className="space-y-4 flex flex-col h-full">
              {/* Participant List (with RBAC Management) */}
              <div className="h-64 flex-shrink-0">
                <ParticipantList
                  participants={participants}
                  currentUserId={currentUserId}
                  userRole={userRole}
                  onAssignRole={handleAssignRole}
                  onRemoveParticipant={handleRemoveParticipant}
                />
              </div>

              {/* Synchronized Room Chat */}
              <div className="flex-1 min-h-[300px] bg-vyntra-card border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-xl">
                <div className="p-3.5 border-b border-vyntra-border/60 bg-vyntra-surface/30">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Party Chat</h4>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Welcome to the sync party! Messages are broadcast live.</span>
                  </div>

                  {chatMessages.map((m) => (
                    <div key={m.id} className="text-xs space-y-0.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{m.username}:</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                          m.role === 'Host' ? 'bg-amber-500/20 text-amber-300' : m.role === 'Moderator' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.role}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs pl-0.5">{m.message}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-2.5 border-t border-vyntra-border/60 bg-vyntra-surface/40 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Chat with the room..."
                    className="flex-1 bg-vyntra-bg border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white transition-all shadow-glow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchTogetherPage;
