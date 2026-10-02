import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocketContext } from './SocketContext';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' | 'audio'
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
  const [remoteUser, setRemoteUser] = useState(null);
  const [callId, setCallId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  // Duration timer
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Socket signaling listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ callId: incomingCallId, caller, callType: incomingType }) => {
      setCallId(incomingCallId);
      setRemoteUser(caller);
      setCallType(incomingType);
      setCallStatus('incoming');
      setCallActive(true);
    };

    const handleCallAccepted = async ({ callId: acceptedCallId }) => {
      setCallStatus('connected');
      await createPeerOffer(remoteUser?._id);
    };

    const handleCallRejected = () => {
      endCallCleanup();
    };

    const handleCallEnded = () => {
      endCallCleanup();
    };

    const handleWebRTCOffer = async ({ offer, callerSocketId }) => {
      if (!peerConnectionRef.current) initPeerConnection();
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          answer,
          targetUserId: remoteUser?._id,
          callId,
        });
      } catch (err) {
        console.warn('WebRTC Offer processing note:', err);
      }
    };

    const handleWebRTCAnswer = async ({ answer }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.warn('WebRTC Answer processing note:', err);
      }
    };

    const handleICECandidate = async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.warn('ICE Candidate processing note:', err);
      }
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('webrtc:offer', handleWebRTCOffer);
    socket.on('webrtc:answer', handleWebRTCAnswer);
    socket.on('webrtc:ice-candidate', handleICECandidate);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('webrtc:offer', handleWebRTCOffer);
      socket.off('webrtc:answer', handleWebRTCAnswer);
      socket.off('webrtc:ice-candidate', handleICECandidate);
    };
  }, [socket, remoteUser, callId]);

  const initLocalStream = async (type = 'video') => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video' ? { width: 1280, height: 720 } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.warn('Media devices note (fallback audio/video track):', err.message);
      // Fallback silent audio / black video canvas stream if camera unavailable
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 640, 480);
      const stream = canvas.captureStream(15);
      localStreamRef.current = stream;
      return stream;
    }
  };

  const initPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && remoteUser) {
        socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate,
          targetUserId: remoteUser._id,
          callId,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const createPeerOffer = async (targetUserId) => {
    const pc = initPeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('webrtc:offer', {
        offer,
        targetUserId,
        callId,
      });
    } catch (err) {
      console.error('Peer offer creation error:', err);
    }
  };

  const startCall = async (targetUser, type = 'video') => {
    setRemoteUser(targetUser);
    setCallType(type);
    setCallStatus('calling');
    setCallActive(true);

    const newCallId = 'call_' + Date.now();
    setCallId(newCallId);

    await initLocalStream(type);

    socket.emit('call:invite', {
      targetUserId: targetUser._id,
      callerId: user?._id || user?.id,
      callType: type,
      callId: newCallId,
    });
  };

  const acceptCall = async () => {
    setCallStatus('connected');
    await initLocalStream(callType);
    initPeerConnection();

    socket.emit('call:accept', {
      targetUserId: remoteUser?._id,
      callId,
      accepterId: user?._id || user?.id,
    });
  };

  const rejectCall = () => {
    if (socket && remoteUser) {
      socket.emit('call:reject', {
        targetUserId: remoteUser._id,
        callId,
        reason: 'declined',
      });
    }
    endCallCleanup();
  };

  const endCall = () => {
    if (socket && remoteUser) {
      socket.emit('call:end', {
        targetUserId: remoteUser._id,
        callId,
      });
    }
    endCallCleanup();
  };

  const endCallCleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    setCallActive(false);
    setCallStatus('idle');
    setRemoteUser(null);
    setCallId(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen sharing cancelled or unavailable:', err.message);
      }
    } else {
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (peerConnectionRef.current && videoTrack) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        }
      }
      setIsScreenSharing(false);
    }
  };

  return (
    <CallContext.Provider
      value={{
        callActive,
        callType,
        callStatus,
        remoteUser,
        callDuration,
        isMuted,
        isCameraOff,
        isScreenSharing,
        localStream: localStreamRef.current,
        remoteStream: remoteStreamRef.current,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
export default CallContext;
