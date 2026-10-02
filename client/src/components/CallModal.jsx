import React, { useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Maximize2, 
  Minimize2,
  Users,
  ShieldCheck
} from 'lucide-react';
import { useCall } from '../context/CallContext';
import { useAuth } from '../context/AuthContext';

const CallModal = () => {
  const { user } = useAuth();
  const {
    callActive,
    callType,
    callStatus,
    remoteUser,
    callDuration,
    isMuted,
    isCameraOff,
    isScreenSharing,
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callActive || callStatus === 'incoming') return null;

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
              {remoteUser?.displayName || remoteUser?.username || 'Encrypted Voice & Video'}
              <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                P2P WebRTC Secure
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {callStatus === 'calling' ? 'Calling...' : `Connected • ${formatDuration(callDuration)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-vyntra-surface/60 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>2 Participants</span>
        </div>
      </div>

      {/* Video / Audio Grid Area */}
      <div className="flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center relative max-w-6xl mx-auto w-full">
        {/* Remote Participant Screen */}
        <div className="relative w-full h-[320px] md:h-[500px] bg-vyntra-card rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl">
          {callType === 'video' && !isCameraOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={remoteUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=remote'}
                  alt="Remote Avatar"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-glow-sm"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-vyntra-bg animate-pulse" />
              </div>
              <p className="font-semibold text-lg text-white">{remoteUser?.displayName || 'Peer User'}</p>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full animate-wave-1" />
                <span className="w-1.5 h-10 bg-indigo-400 rounded-full animate-wave-3" />
                <span className="w-1.5 h-7 bg-cyan-400 rounded-full animate-wave-5" />
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full animate-wave-2" />
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/10">
            {remoteUser?.displayName || 'Remote Peer'}
          </div>
        </div>

        {/* Local Stream Screen */}
        <div className="relative w-full h-[320px] md:h-[500px] bg-vyntra-card rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl">
          {callType === 'video' && !isCameraOff ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=local'}
                alt="Local Avatar"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-indigo-500/30"
              />
              <p className="font-semibold text-lg text-white">{user?.displayName || 'You'} (You)</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-white/10">
            You {isMuted && '(Muted)'}
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex items-center justify-center gap-3 md:gap-4 z-10">
        <button
          onClick={toggleMute}
          className={`p-3.5 md:p-4 rounded-2xl font-semibold transition-all ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-vyntra-surface text-slate-200 hover:bg-vyntra-cardHover border border-white/10'
          }`}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {callType === 'video' && (
          <button
            onClick={toggleCamera}
            className={`p-3.5 md:p-4 rounded-2xl font-semibold transition-all ${
              isCameraOff
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-vyntra-surface text-slate-200 hover:bg-vyntra-cardHover border border-white/10'
            }`}
            title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={toggleScreenShare}
          className={`p-3.5 md:p-4 rounded-2xl font-semibold transition-all ${
            isScreenSharing
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-vyntra-surface text-slate-200 hover:bg-vyntra-cardHover border border-white/10'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={endCall}
          className="p-3.5 md:p-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
          title="End Call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline">End Call</span>
        </button>
      </div>
    </div>
  );
};

export default CallModal;
