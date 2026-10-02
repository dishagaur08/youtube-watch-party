import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../context/CallContext';

const IncomingCallDialog = () => {
  const { callActive, callStatus, remoteUser, callType, acceptCall, rejectCall } = useCall();

  if (!callActive || callStatus !== 'incoming') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-vyntra-card border border-indigo-500/40 p-5 rounded-3xl shadow-2xl shadow-indigo-500/20 max-w-sm w-full animate-bounce-subtle">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img
            src={remoteUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=caller'}
            alt="Caller"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500"
          />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <div>
          <h4 className="font-bold text-white text-base">{remoteUser?.displayName || remoteUser?.username || 'Vyntra User'}</h4>
          <p className="text-xs text-indigo-400 flex items-center gap-1 font-medium">
            {callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            Incoming {callType === 'video' ? 'Video Call' : 'Voice Call'}...
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={rejectCall}
          className="flex-1 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
        >
          <PhoneOff className="w-4 h-4" />
          Decline
        </button>

        <button
          onClick={acceptCall}
          className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Phone className="w-4 h-4" />
          Accept
        </button>
      </div>
    </div>
  );
};

export default IncomingCallDialog;
