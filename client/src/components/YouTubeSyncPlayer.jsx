import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

/**
 * YouTubeSyncPlayer
 * Encapsulates YouTube IFrame Player with precision synchronization,
 * drift correction threshold, remote action locks, and permission handling.
 */
const YouTubeSyncPlayer = ({
  videoId,
  playState,
  currentTime,
  canControl,
  userRole,
  onPlay,
  onPause,
  onSeek,
}) => {
  const playerRef = useRef(null);
  const isRemoteActionRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Precision YouTube Player options
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: canControl ? 1 : 0, // Disable native player controls for participants
      disablekb: canControl ? 0 : 1, // Disable keyboard controls for participants
      modestbranding: 1,
      rel: 0,
      origin: window.location.origin,
    },
  };

  // Synchronize remote playState and currentTime changes from WebSocket
  useEffect(() => {
    if (!playerRef.current || !playerReady) return;

    try {
      const player = playerRef.current;
      const localTime = player.getCurrentTime() || 0;
      const targetTime = Number(currentTime) || 0;
      const drift = Math.abs(localTime - targetTime);

      isRemoteActionRef.current = true;

      // Sync seek position if drift exceeds 1.5 seconds
      if (drift > 1.5) {
        player.seekTo(targetTime, true);
      }

      // Sync play/pause state
      if (playState === 'PLAYING') {
        const playPromise = player.playVideo();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            setAutoplayBlocked(true);
          });
        }
      } else if (playState === 'PAUSED') {
        player.pauseVideo();
      }

      setTimeout(() => {
        isRemoteActionRef.current = false;
      }, 600);
    } catch (err) {
      console.error('Player sync error:', err);
      isRemoteActionRef.current = false;
    }
  }, [videoId, playState, currentTime, playerReady]);

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    setPlayerReady(true);

    if (playState === 'PLAYING') {
      try {
        event.target.playVideo();
      } catch {
        setAutoplayBlocked(true);
      }
    }
  };

  const onPlayerStateChange = (event) => {
    // If state changed due to a remote socket command, ignore to avoid echo broadcast loops
    if (isRemoteActionRef.current) return;

    // Only Host and Moderator are authorized to trigger socket sync updates
    if (!canControl) {
      // If a participant clicked inside iframe and altered state, snap back to room sync
      if (playState === 'PLAYING') {
        event.target.playVideo();
      } else {
        event.target.pauseVideo();
      }
      return;
    }

    const state = event.data;
    const currentT = event.target.getCurrentTime();

    // YouTube Player States: 1 = PLAYING, 2 = PAUSED
    if (state === 1) {
      onPlay?.(currentT);
    } else if (state === 2) {
      onPause?.(currentT);
    }
  };

  const handleTuneInAutoplay = () => {
    if (playerRef.current) {
      playerRef.current.unMute();
      playerRef.current.playVideo();
      setAutoplayBlocked(false);
      setIsMuted(false);
    }
  };

  return (
    <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group flex items-center justify-center">
      {/* YouTube IFrame Embed */}
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full object-cover"
      />

      {/* Participant Read-Only Protective Overlay */}
      {!canControl && (
        <div className="absolute top-4 left-4 pointer-events-none z-20 flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[11px] font-mono flex items-center gap-1.5 shadow-lg">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Synced as {userRole} (View Only)</span>
          </span>
        </div>
      )}

      {/* Autoplay Blocked / Unmute Overlay */}
      {autoplayBlocked && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
          <div className="p-4 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Volume2 className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white">Playback is in Sync</h3>
            <p className="text-xs text-slate-300 mt-1">
              Browser audio autoplay is currently paused. Click below to tune in live with the party.
            </p>
          </div>
          <button
            onClick={handleTuneInAutoplay}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tune In Live & Unmute</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default YouTubeSyncPlayer;
