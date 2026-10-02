import React, { useState, useEffect } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, Clock, Users, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import api from '../services/api';

const CallsPage = () => {
  const { user } = useAuth();
  const { startCall } = useCall();
  const [callHistory, setCallHistory] = useState([]);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [callsRes, usersRes] = await Promise.all([
          api.get('/calls/history').catch(() => ({ data: { data: [] } })),
          api.get('/users/search').catch(() => ({ data: { data: [] } })),
        ]);
        setCallHistory(callsRes.data?.data || []);
        setUsersList(usersRes.data?.data || []);
      } catch (err) {
        console.error('Fetch calls error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full select-none">
      <div className="pb-4 border-b border-vyntra-border/60">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Phone className="w-6 h-6 text-emerald-400" />
          <span>WebRTC Voice & Video Hub</span>
        </h2>
        <p className="text-xs text-slate-400">Encrypted peer-to-peer communication, screen sharing & direct dialer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Online Contacts & Instant Call */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-white">Direct Connect Contacts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {usersList.map((peer) => (
              <div
                key={peer._id || peer.id}
                className="p-4 rounded-3xl bg-vyntra-card border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={peer.avatar}
                      alt={peer.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-vyntra-bg" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{peer.displayName}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">@{peer.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall(peer, 'audio')}
                    className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-colors"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startCall(peer, 'video')}
                    className="p-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500 text-indigo-400 hover:text-white transition-colors"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Call Logs History */}
        <div className="bg-vyntra-card rounded-3xl p-5 border border-white/5 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Call Logs</span>
          </h3>

          <div className="space-y-2.5">
            {callHistory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                No recent calls recorded. Dial a peer on the left to start a call.
              </div>
            ) : (
              callHistory.map((c) => (
                <div key={c._id} className="p-3 rounded-2xl bg-vyntra-surface/30 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {c.caller === (user?._id || user?.id) ? (
                      <PhoneOutgoing className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <PhoneIncoming className="w-4 h-4 text-emerald-400" />
                    )}
                    <div>
                      <p className="font-bold text-white">
                        {c.caller === (user?._id || user?.id) ? c.receiverDetail?.displayName || 'Peer' : c.callerDetail?.displayName || 'Peer'}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize">{c.type} Call • {c.duration || 0}s</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallsPage;
